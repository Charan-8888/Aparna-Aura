from rest_framework import serializers
from apps.products.serializers import ProductSerializer
from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    """Read serializer — returns the full nested product."""
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'created_at')
        read_only_fields = ('id', 'created_at')


class AddWishlistSerializer(serializers.Serializer):
    """Input serializer for POST /wishlist/."""
    product_id = serializers.UUIDField()
