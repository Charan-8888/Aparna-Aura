"""
Management command: seed_aura_products

Imports all Aparna Aura categories and products into the database and uploads
their images to Cloudinary.  Safe to re-run — existing records are skipped by
default; use --overwrite to replace them.

Usage
-----
  python manage.py seed_aura_products            # skip existing
  python manage.py seed_aura_products --overwrite  # replace everything
  python manage.py seed_aura_products --skip-images  # metadata only, no Cloudinary
"""

from pathlib import Path

from cloudinary import CloudinaryResource, uploader
from django.core.management.base import BaseCommand

from apps.products.category_pack import CATEGORY_IMAGE_PACK
from apps.products.models import Category, Product, ProductImage
from apps.products.product_pack import AURA_PRODUCT_CATEGORIES, AURA_PRODUCT_PACK

CATEGORY_PACK_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "static" / "products" / "category_pack"
)
PRODUCT_PACK_HD_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "static" / "products" / "product_pack_hd"
)


class Command(BaseCommand):
    help = (
        "Seed Aparna Aura categories and products into the database and upload "
        "images to Cloudinary.  Idempotent — existing records are skipped unless "
        "--overwrite is supplied."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace existing category/product records and re-upload images.",
        )
        parser.add_argument(
            "--skip-images",
            action="store_true",
            help="Create/update DB records only; do not upload images to Cloudinary.",
        )

    def handle(self, *args, **options):
        overwrite = options["overwrite"]
        skip_images = options["skip_images"]

        self.stdout.write(self.style.MIGRATE_HEADING(
            "=== Aparna Aura — Product Seeder ==="
        ))
        self.stdout.write(
            f"  overwrite={overwrite}  skip_images={skip_images}\n"
        )

        # ── 1. Seed categories ────────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING("\n── Categories ──"))
        cat_created = cat_images = cat_skipped = 0
        cat_failures = []

        all_category_meta = {}
        for item in CATEGORY_IMAGE_PACK:
            all_category_meta[item["slug"]] = item

        for item in CATEGORY_IMAGE_PACK:
            category, created = Category.objects.get_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "description": item["description"],
                    "display_order": item["display_order"],
                    "is_active": True,
                },
            )
            if created:
                cat_created += 1
                self.stdout.write(f"  [NEW] {item['name']}")
            else:
                self.stdout.write(f"  [OK]  {item['name']}")

            if category.image and not overwrite:
                cat_skipped += 1
                continue

            if skip_images:
                continue

            image_path = CATEGORY_PACK_DIR / item["filename"]
            if not image_path.exists():
                cat_failures.append(f"{item['name']}: image file missing at {image_path}")
                continue

            try:
                result = uploader.upload(
                    str(image_path),
                    resource_type="image",
                    public_id=f"aparna_aura/categories/{item['slug']}",
                    overwrite=True,
                    unique_filename=False,
                )
                category.image = CloudinaryResource(
                    public_id=result["public_id"],
                    format=result.get("format"),
                    version=result.get("version"),
                    resource_type=result.get("resource_type", "image"),
                    type=result.get("type", "upload"),
                )
                category.save(update_fields=["image"])
                cat_images += 1
                self.stdout.write(self.style.SUCCESS(f"         ✓ image uploaded"))
            except Exception as exc:
                cat_failures.append(f"{item['name']}: {exc}")
                self.stdout.write(self.style.ERROR(f"         ✗ {exc}"))

        # ── 2. Seed extra product-pack-only categories (mangalsutra, watches) ─
        extra_cat_objects = {}
        for slug, metadata in AURA_PRODUCT_CATEGORIES.items():
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": metadata["name"],
                    "description": metadata["description"],
                    "display_order": metadata["display_order"],
                    "is_active": True,
                },
            )
            if created:
                cat_created += 1
                self.stdout.write(f"  [NEW] {metadata['name']} (product-pack category)")
            extra_cat_objects[slug] = category

        # ── 3. Seed products ──────────────────────────────────────────────────
        self.stdout.write(self.style.MIGRATE_HEADING("\n── Products ──"))
        prod_created = prod_updated = prod_skipped = img_uploaded = 0
        prod_failures = []

        # Merge all category objects
        all_categories = {
            c.slug: c for c in Category.objects.all()
        }

        for item in AURA_PRODUCT_PACK:
            category = all_categories.get(item["category_slug"])
            if category is None:
                prod_failures.append(f"{item['sku']}: category '{item['category_slug']}' not found")
                continue

            product = Product.objects.filter(sku=item["sku"]).first()
            existed = product is not None

            if existed and not overwrite:
                prod_skipped += 1
                continue

            if product is None:
                product = Product(sku=item["sku"])

            product.name = item["name"]
            product.slug = item["slug"]
            product.category = category
            product.description = item["description"]
            product.price = item["price"]
            product.discount_percentage = 0
            product.stock = item["stock"]
            product.is_active = item["is_active"]
            product.is_featured = item["is_featured"]
            product.is_new_arrival = item["is_new_arrival"]
            product.is_trending = item["is_trending"]
            product.meta_title = item["meta_title"]
            product.meta_description = item["meta_description"]

            try:
                product.save()
            except Exception as exc:
                prod_failures.append(f"{item['sku']} {item['name']}: {exc}")
                self.stdout.write(self.style.ERROR(f"  ✗ {item['sku']} — {exc}"))
                continue

            if existed:
                prod_updated += 1
                self.stdout.write(f"  [UPD] {item['sku']} {item['name']}")
            else:
                prod_created += 1
                self.stdout.write(f"  [NEW] {item['sku']} {item['name']}")

            if skip_images:
                continue

            if overwrite:
                product.images.all().delete()

            for index, filename in enumerate(item["images"], start=1):
                # Skip if image already exists and not overwriting
                if not overwrite and product.images.filter(
                    alt_text__icontains=f"view {index}"
                ).exists():
                    continue

                image_path = PRODUCT_PACK_HD_DIR / filename
                if not image_path.exists():
                    prod_failures.append(f"{item['sku']} image {filename}: file missing")
                    continue

                try:
                    result = uploader.upload(
                        str(image_path),
                        resource_type="image",
                        public_id=f"aparna_aura/products/{item['sku'].lower()}/{index:02d}",
                        overwrite=True,
                        unique_filename=False,
                    )
                    resource = CloudinaryResource(
                        public_id=result["public_id"],
                        format=result.get("format"),
                        version=result.get("version"),
                        resource_type=result.get("resource_type", "image"),
                        type=result.get("type", "upload"),
                    )
                    ProductImage.objects.create(
                        product=product,
                        image=resource,
                        is_featured=(index == 1),
                        alt_text=f"{item['name']} - view {index}"[:100],
                    )
                    img_uploaded += 1

                    # Use first product image as category hero for accessory categories
                    if index == 1 and not category.image and item["category_slug"] in {
                        "mangalsutra", "watches"
                    }:
                        category.image = resource
                        category.save(update_fields=["image"])
                        self.stdout.write(f"         ↳ set as category hero image")

                except Exception as exc:
                    prod_failures.append(f"{item['sku']} image {index}: {exc}")

        # ── 4. Apply price updates ────────────────────────────────────────────
        self._apply_prices()

        # ── 5. Summary ────────────────────────────────────────────────────────
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS(
            f"SUMMARY\n"
            f"  Categories created:   {cat_created}\n"
            f"  Category images:      {cat_images}\n"
            f"  Products created:     {prod_created}\n"
            f"  Products updated:     {prod_updated}\n"
            f"  Products skipped:     {prod_skipped}\n"
            f"  Product images:       {img_uploaded}\n"
        ))
        if prod_failures or cat_failures:
            self.stdout.write(self.style.WARNING("FAILURES:"))
            for f in cat_failures + prod_failures:
                self.stdout.write(self.style.ERROR(f"  • {f}"))
        else:
            self.stdout.write(self.style.SUCCESS("  No failures — all done ✓"))

    # ── Price helper ──────────────────────────────────────────────────────────
    @staticmethod
    def _apply_prices():
        """Apply the confirmed price map from update_aura_prices to all products."""
        from decimal import Decimal
        PRICE_MAP = {
            'AURA-P003': Decimal('330.00'),
            'AURA-P004': Decimal('360.00'),
            'AURA-P021': Decimal('650.00'),
            'AURA-P022': Decimal('650.00'),
            'AURA-P023': Decimal('650.00'),
            'AURA-P024': Decimal('650.00'),
            'AURA-P025': Decimal('650.00'),
            'AURA-P026': Decimal('750.00'),
            'AURA-P027': Decimal('750.00'),
            'AURA-P028': Decimal('400.00'),
            'AURA-P005': Decimal('300.00'),
            'AURA-P029': Decimal('200.00'),
            'AURA-P006': Decimal('150.00'),
            'AURA-P007': Decimal('150.00'),
            'AURA-P008': Decimal('150.00'),
            'AURA-P009': Decimal('140.00'),
            'AURA-P010': Decimal('160.00'),
            'AURA-P011': Decimal('160.00'),
            'AURA-P012': Decimal('160.00'),
            'AURA-P013': Decimal('160.00'),
            'AURA-P014': Decimal('150.00'),
            'AURA-P015': Decimal('150.00'),
            'AURA-P016': Decimal('150.00'),
            'AURA-P017': Decimal('150.00'),
            'AURA-P018': Decimal('130.00'),
            'AURA-P019': Decimal('130.00'),
            'AURA-P020': Decimal('130.00'),
            'AURA-P030': Decimal('349.00'),
            'AURA-P031': Decimal('390.00'),
            'AURA-P032': Decimal('290.00'),
            'AURA-P033': Decimal('160.00'),
            'AURA-P034': Decimal('260.00'),
            'AURA-P035': Decimal('210.00'),
            'AURA-P036': Decimal('170.00'),
            'AURA-P037': Decimal('290.00'),
            'AURA-P038': Decimal('240.00'),
            'AURA-P039': Decimal('160.00'),
            'AURA-P040': Decimal('140.00'),
        }
        updated = 0
        for sku, price in PRICE_MAP.items():
            updated += Product.objects.filter(sku=sku).exclude(price=price).update(price=price)
        if updated:
            print(f"  Prices updated: {updated} product(s)")
