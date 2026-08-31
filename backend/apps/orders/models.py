import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
from apps.users.models import Address

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Financial snapshots
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2) # Grand Total
    
    # Address snapshots (using FK but potentially you'd want to copy address text in a real app, keeping FK for now per architecture)
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name='shipping_orders', null=True, blank=True)
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name='billing_orders', null=True, blank=True)
    
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.email}"

    @property
    def latest_transaction(self):
        return self.transactions.order_by('-created_at').first()

    @property
    def is_paid(self):
        return self.status in ['confirmed', 'processing', 'packed', 'shipped', 'delivered'] or self.transactions.filter(status='success').exists()

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.RESTRICT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Order: {self.order.id})"
