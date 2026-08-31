from rest_framework import serializers
from .models import Category, Product, ProductImage


def secure_image_url(image):
    """Return uploaded Cloudinary media using a browser-safe HTTPS URL."""
    if not image:
        return None

    try:
        url = image.url
    except Exception:
        url = str(image)

    return url.replace('http://res.cloudinary.com/', 'https://res.cloudinary.com/', 1)


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_image(self, obj):
        return secure_image_url(obj.image)
        


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_featured', 'alt_text')

    def get_image(self, obj):
        return secure_image_url(obj.image)


class ProductSerializer(serializers.ModelSerializer):
    """Customer-safe product representation used by every public endpoint."""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    is_in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'images', 'name', 'slug', 'description', 'price',
            'discount_percentage', 'stock', 'is_active', 'is_featured', 'is_new_arrival',
            'is_trending', 'meta_title', 'meta_description', 'created_at', 'updated_at',
            'is_in_stock',
        )
        read_only_fields = fields

    def get_is_in_stock(self, obj):
        return obj.is_active and obj.stock > 0


class StaffProductSerializer(ProductSerializer):
    """Full inventory data is only available to staff/admin API users."""

    class Meta(ProductSerializer.Meta):
        fields = '__all__'
