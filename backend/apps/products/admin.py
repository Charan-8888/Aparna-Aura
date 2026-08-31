from pathlib import Path

from cloudinary import CloudinaryResource, uploader
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html

from .category_pack import CATEGORY_IMAGE_PACK
from .product_pack import AURA_PRODUCT_CATEGORIES, AURA_PRODUCT_PACK
from .models import Category, Product, ProductImage


CATEGORY_PACK_DIR = Path(__file__).resolve().parent / 'static' / 'products' / 'category_pack'
PRODUCT_PACK_HD_DIR = Path(__file__).resolve().parent / 'static' / 'products' / 'product_pack_hd'


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_preview', 'image', 'is_featured', 'alt_text')
    readonly_fields = ('image_preview',)

    @admin.display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:8px;" />',
                obj.image.url,
            )
        return '—'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    change_list_template = 'admin/products/category/change_list.html'
    list_display = ('image_preview', 'name', 'slug', 'is_active', 'display_order', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order', 'name')
    readonly_fields = ('large_image_preview', 'created_at')

    fieldsets = (
        ('Category', {
            'fields': ('name', 'slug', 'description', 'image', 'large_image_preview')
        }),
        ('Storefront', {
            'fields': ('is_active', 'display_order')
        }),
        ('Record', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'aura-image-pack/',
                self.admin_site.admin_view(self.aura_image_pack_view),
                name='products_category_aura_image_pack',
            ),
        ]
        return custom_urls + urls

    @admin.display(description='Image')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" alt="" style="width:58px;height:46px;object-fit:cover;border-radius:7px;" />',
                obj.image.url,
            )
        return '—'

    @admin.display(description='Current storefront preview')
    def large_image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" alt="" style="width:min(100%,520px);aspect-ratio:5/4;object-fit:cover;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.12);" />',
                obj.image.url,
            )
        return 'Upload an image to preview it here.'

    def aura_image_pack_view(self, request):
        if not self.has_change_permission(request):
            raise PermissionDenied

        pack_items = [
            {
                **item,
                'static_path': f"products/category_pack/{item['filename']}",
            }
            for item in CATEGORY_IMAGE_PACK
        ]

        if request.method == 'POST':
            overwrite = request.POST.get('overwrite') == 'on'
            created_count = 0
            image_count = 0
            skipped_count = 0
            failures = []

            for item in CATEGORY_IMAGE_PACK:
                category, created = Category.objects.get_or_create(
                    slug=item['slug'],
                    defaults={
                        'name': item['name'],
                        'description': item['description'],
                        'display_order': item['display_order'],
                        'is_active': True,
                    },
                )

                if created:
                    created_count += 1
                else:
                    metadata_changed = False
                    if category.name != item['name']:
                        category.name = item['name']
                        metadata_changed = True
                    if not category.description:
                        category.description = item['description']
                        metadata_changed = True
                    if category.display_order != item['display_order']:
                        category.display_order = item['display_order']
                        metadata_changed = True
                    if metadata_changed:
                        category.save(update_fields=['name', 'description', 'display_order'])

                if category.image and not overwrite:
                    skipped_count += 1
                    continue

                image_path = CATEGORY_PACK_DIR / item['filename']
                if not image_path.exists():
                    failures.append(f"{item['name']}: packaged image file is missing")
                    continue

                try:
                    result = uploader.upload(
                        str(image_path),
                        resource_type='image',
                        public_id=f"aparna_aura/categories/{item['slug']}",
                        overwrite=True,
                        unique_filename=False,
                    )
                    category.image = CloudinaryResource(
                        public_id=result['public_id'],
                        format=result.get('format'),
                        version=result.get('version'),
                        resource_type=result.get('resource_type', 'image'),
                        type=result.get('type', 'upload'),
                    )
                    category.save(update_fields=['image'])
                    image_count += 1
                except Exception as exc:  # Cloudinary/network errors should be surfaced in Admin.
                    failures.append(f"{item['name']}: {exc}")

            if image_count:
                self.message_user(
                    request,
                    f"Aura category pack applied: {image_count} image(s) uploaded, {created_count} category record(s) created.",
                    level=messages.SUCCESS,
                )
            if skipped_count:
                self.message_user(
                    request,
                    f"{skipped_count} existing category image(s) were kept because replacement was disabled.",
                    level=messages.INFO,
                )
            if failures:
                self.message_user(
                    request,
                    'Some images could not be applied: ' + ' | '.join(failures),
                    level=messages.ERROR,
                )

            return self._redirect_to_category_list()

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Apply Aura category images',
            'pack_items': pack_items,
        }
        return TemplateResponse(
            request,
            'admin/products/category/aura_image_pack.html',
            context,
        )

    @staticmethod
    def _redirect_to_category_list():
        from django.shortcuts import redirect
        return redirect(reverse('admin:products_category_changelist'))


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    change_list_template = 'admin/products/product/change_list.html'
    list_display = (
        'image_thumbnail', 'name', 'category', 'sku', 'price', 'discount_percentage',
        'stock', 'is_active', 'is_featured', 'is_trending', 'is_new_arrival', 'created_at',
    )
    list_filter = ('category', 'is_active', 'is_featured', 'is_trending', 'is_new_arrival')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'sku', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('stock',)
        }),
        ('Visibility', {
            'fields': ('is_active', 'is_featured', 'is_trending', 'is_new_arrival')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description')
        }),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'aura-product-pack/',
                self.admin_site.admin_view(self.aura_product_pack_view),
                name='products_product_aura_product_pack',
            ),
        ]
        return custom_urls + urls

    def aura_product_pack_view(self, request):
        if not self.has_change_permission(request):
            raise PermissionDenied

        pack_items = [
            {
                **item,
                'preview_static_path': f"products/product_pack_preview/{item['preview']}",
                'image_count': len(item['images']),
                'category_name': AURA_PRODUCT_CATEGORIES[item['category_slug']]['name'],
            }
            for item in AURA_PRODUCT_PACK
        ]

        if request.method == 'POST':
            overwrite = request.POST.get('overwrite') == 'on'
            created_products = 0
            updated_products = 0
            uploaded_images = 0
            skipped_products = 0
            created_categories = 0
            failures = []
            category_objects = {}

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
                category_objects[slug] = category

            for item in AURA_PRODUCT_PACK:
                category = category_objects[item['category_slug']]
                product = Product.objects.filter(sku=item['sku']).first()
                existed = product is not None

                # When replacement is disabled, preserve every manual Admin edit on
                # previously imported products (price, stock, copy and gallery).
                if existed and not overwrite:
                    skipped_products += 1
                    continue

                if product is None:
                    product = Product(sku=item['sku'])

                # With replacement enabled, the supplied pack is authoritative.
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
                    failures.append(f"{item['sku']} {item['name']}: could not save product ({exc})")
                    continue

                if existed:
                    updated_products += 1
                else:
                    created_products += 1

                if overwrite:
                    product.images.all().delete()

                for index, filename in enumerate(item['images'], start=1):
                    image_path = PRODUCT_PACK_HD_DIR / filename
                    if not image_path.exists():
                        failures.append(f"{item['sku']} {item['name']}: packaged image {filename} is missing")
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

                        # New accessory categories did not have supplied category artwork.
                        # Use the first real product photograph as a sensible storefront hero.
                        if index == 1 and not category.image and item['category_slug'] in {'mangalsutra', 'watches'}:
                            category.image = resource
                            category.save(update_fields=['image'])
                    except Exception as exc:
                        failures.append(f"{item['sku']} {item['name']} image {index}: {exc}")

            if created_products or updated_products:
                self.message_user(
                    request,
                    f"Aura product pack processed: {created_products} product(s) created, {updated_products} updated, {uploaded_images} HD image(s) uploaded, {created_categories} category record(s) created.",
                    level=messages.SUCCESS,
                )
            if skipped_products:
                self.message_user(
                    request,
                    f"{skipped_products} existing Aura products were left unchanged because replacement was disabled.",
                    level=messages.INFO,
                )
            if failures:
                self.message_user(
                    request,
                    'Some products/images could not be imported: ' + ' | '.join(failures[:8]) + (f" | plus {len(failures)-8} more" if len(failures) > 8 else ''),
                    level=messages.ERROR,
                )
            return self._redirect_to_product_list()

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Import Aura products',
            'pack_items': pack_items,
            'product_count': len(AURA_PRODUCT_PACK),
            'image_count': sum(len(item['images']) for item in AURA_PRODUCT_PACK),
        }
        return TemplateResponse(request, 'admin/products/product/aura_product_pack.html', context)

    @staticmethod
    def _redirect_to_product_list():
        from django.shortcuts import redirect
        return redirect(reverse('admin:products_product_changelist'))

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category').prefetch_related('images')

    @admin.display(description='Image')
    def image_thumbnail(self, obj):
        first_image = obj.images.filter(is_featured=True).first() or obj.images.first()
        if first_image and first_image.image:
            return format_html(
                '<img src="{}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:7px;" />',
                first_image.image.url,
            )
        return '—'
