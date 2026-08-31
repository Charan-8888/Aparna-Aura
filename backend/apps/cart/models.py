import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product


class Cart(models.Model):
    """
    Shopping cart — one **active** cart per authenticated user.

    The ``is_active`` flag ensures historical carts are preserved
    while only one cart is ever usable at a time.
    UUID primary key follows the project-wide convention.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carts',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Database-level guarantee: at most one active cart per user.
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(is_active=True),
                name='unique_active_cart_per_user',
            ),
        ]

    def __str__(self):
        status = "active" if self.is_active else "inactive"
        return f"Cart ({status}) for {self.user}"


class CartItem(models.Model):
    """
    Individual line-item inside a cart.

    ``unit_price`` is a snapshot captured at add-time so later
    product-price changes do not silently alter the user's expected total.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One row per product per cart.
        unique_together = ('cart', 'product')

    @property
    def subtotal(self):
        """Line-item subtotal = quantity × unit_price."""
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"
