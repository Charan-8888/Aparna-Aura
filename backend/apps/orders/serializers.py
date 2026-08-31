from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer

class CheckoutSerializer(serializers.Serializer):
    """Input serializer for POST /orders/checkout/"""
    shipping_address_id = serializers.UUIDField()
    billing_address_id = serializers.UUIDField(required=False, allow_null=True)

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'unit_price')
        read_only_fields = fields

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'user', 'status', 'subtotal', 'tax_amount', 
            'shipping_fee', 'discount_amount', 'total_amount',
            'shipping_address', 'billing_address', 'tracking_number',
            'created_at', 'updated_at', 'items'
        )
        read_only_fields = fields
