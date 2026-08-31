"""
Idempotent/resumable Aura product importer.
- If a product already exists with the correct number of images, it is skipped.
- If a product exists but has fewer images than expected, it is re-imported (overwrite).
- If a product does not exist, it is created.
- Running again after a partial failure will pick up where it left off.
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from pathlib import Path
from cloudinary import CloudinaryResource, uploader
from apps.products.models import Category, Product, ProductImage
from apps.products.product_pack import AURA_PRODUCT_CATEGORIES, AURA_PRODUCT_PACK

PRODUCT_PACK_HD_DIR = Path(__file__).resolve().parent / 'apps' / 'products' / 'static' / 'products' / 'product_pack_hd'

created_products = 0
updated_products = 0
uploaded_images = 0
skipped_products = 0
created_categories = 0
failures = []
category_objects = {}

print(f"=== Aura Product Importer (Idempotent/Resumable) ===")
print(f"Products to import: {len(AURA_PRODUCT_PACK)}")
print(f"HD image directory: {PRODUCT_PACK_HD_DIR}")
print(f"HD images available: {len(list(PRODUCT_PACK_HD_DIR.glob('*')))}")
print()

# Step 1: Categories
print("--- Creating/updating categories ---")
for slug, metadata in AURA_PRODUCT_CATEGORIES.items():
    category, created = Category.objects.get_or_create(
        slug=slug,
        defaults={
            'name': metadata['name'],
            'description': metadata['description'],
            'display_order': metadata['display_order'],
            'is_active': True,
        },
    )
    if created:
        created_categories += 1
        print(f"  [NEW] {metadata['name']}")
    else:
        changed = False
        if not category.description:
            category.description = metadata['description']
            changed = True
        if not category.is_active:
            category.is_active = True
            changed = True
        if changed:
            category.save(update_fields=['description', 'is_active'])
        print(f"  [OK]  {metadata['name']} (exists)")
    category_objects[slug] = category

print(f"\nCategories: {created_categories} created, {len(AURA_PRODUCT_CATEGORIES) - created_categories} existing")
print()

# Step 2: Products + Images
print("--- Importing products ---")
total = len(AURA_PRODUCT_PACK)
for i, item in enumerate(AURA_PRODUCT_PACK, 1):
    category = category_objects[item['category_slug']]
    product = Product.objects.filter(sku=item['sku']).first()
    existed = product is not None
    expected_images = len(item['images'])

    # Idempotent check: if product exists and has all images, skip
    if existed:
        current_image_count = product.images.count()
        if current_image_count >= expected_images:
            skipped_products += 1
            print(f"  [{i:02d}/{total}] SKIP {item['sku']} {item['name']} ({current_image_count}/{expected_images} images OK)")
            continue
        else:
            # Needs re-import: has fewer images than expected (partial failure)
            print(f"  [{i:02d}/{total}] RESUME {item['sku']} {item['name']} ({current_image_count}/{expected_images} images, re-importing)")
            product.images.all().delete()

    if product is None:
        product = Product(sku=item['sku'])

    product.name = item['name']
    product.slug = item['slug']
    product.category = category
    product.description = item['description']
    product.price = item['price']
    product.discount_percentage = 0
    product.stock = item['stock']
    product.is_active = item['is_active']
    product.is_featured = item['is_featured']
    product.is_new_arrival = item['is_new_arrival']
    product.is_trending = item['is_trending']
    product.meta_title = item['meta_title']
    product.meta_description = item['meta_description']

    try:
        product.save()
    except Exception as exc:
        failures.append(f"{item['sku']} {item['name']}: could not save ({exc})")
        print(f"  [{i:02d}/{total}] FAIL {item['sku']} {item['name']}: {exc}")
        continue

    if existed:
        updated_products += 1
    else:
        created_products += 1

    img_count = 0
    for index, filename in enumerate(item['images'], start=1):
        image_path = PRODUCT_PACK_HD_DIR / filename
        if not image_path.exists():
            failures.append(f"{item['sku']}: image {filename} missing")
            print(f"    [!] Missing: {filename}")
            continue
        try:
            result = uploader.upload(
                str(image_path),
                resource_type='image',
                public_id=f"aparna_aura/products/{item['sku'].lower()}/{index:02d}",
                overwrite=True,
                unique_filename=False,
            )
            resource = CloudinaryResource(
                public_id=result['public_id'],
                format=result.get('format'),
                version=result.get('version'),
                resource_type=result.get('resource_type', 'image'),
                type=result.get('type', 'upload'),
            )
            ProductImage.objects.create(
                product=product,
                image=resource,
                is_featured=index == 1,
                alt_text=f"{item['name']} - view {index}"[:100],
            )
            uploaded_images += 1
            img_count += 1

            if index == 1 and not category.image and item['category_slug'] in {'mangalsutra', 'watches'}:
                category.image = resource
                category.save(update_fields=['image'])
        except Exception as exc:
            failures.append(f"{item['sku']} image {index}: {exc}")
            print(f"    [!] Upload fail: {filename}: {exc}")

    status = "NEW" if not existed else "UPD"
    print(f"  [{i:02d}/{total}] [{status}] {item['sku']} {item['name']} ({img_count}/{expected_images} images)")

print()
print("=" * 60)
print(f"IMPORT COMPLETE")
print(f"  Products created:   {created_products}")
print(f"  Products updated:   {updated_products}")
print(f"  Products skipped:   {skipped_products}")
print(f"  Images uploaded:    {uploaded_images}")
print(f"  Categories created: {created_categories}")
print(f"  Failures:           {len(failures)}")
if failures:
    print(f"\n  FAILURES:")
    for f in failures:
        print(f"    - {f}")
print()
total_products = Product.objects.count()
total_images = ProductImage.objects.count()
total_categories = Category.objects.count()
print(f"Total products in DB: {total_products}")
print(f"Total images in DB:   {total_images}")
print(f"Total categories:     {total_categories}")

# Verify expected counts
if total_products == 65:
    print("\n[OK] Product count matches expected (65)")
else:
    print(f"\n[!] Product count mismatch: expected 65, got {total_products}")
if total_images == 113:
    print("[OK] Image count matches expected (113)")
else:
    print(f"[!] Image count mismatch: expected 113, got {total_images}")
