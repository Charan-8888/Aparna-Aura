from rest_framework import serializers
from apps.products.serializers import ProductSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Read serializer — returns full product details and calculated subtotal."""
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = CartItem
        fields = (
            'id', 'product', 'quantity', 'unit_price', 'subtotal',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'unit_price', 'created_at', 'updated_at')


class AddCartItemSerializer(serializers.Serializer):
    """Input serializer for POST /cart/items/."""
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Input serializer for PATCH /cart/items/{id}/."""
    quantity = serializers.IntegerField(min_value=1)


class CartSerializer(serializers.ModelSerializer):
    """
    Read serializer for the full cart response.

    Computed totals (total_items, subtotal, estimated_tax,
    estimated_shipping, grand_total) are injected onto the cart
    instance by the view before serialization.
    """
    items = CartItemSerializer(source='prefetched_items', many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )
    estimated_tax = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )
    estimated_shipping = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )
    grand_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = Cart
        fields = (
            'id', 'is_active', 'items',
            'total_items', 'subtotal',
            'estimated_tax', 'estimated_shipping', 'grand_total',
            'created_at', 'updated_at',
        )
