import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product


class Wishlist(models.Model):
    """
    A single wishlist entry — one row per user-product pair.

    Uses a flat model (no parent container) since wishlist items
    are independent of each other and don't need shared metadata.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist_items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlisted_by',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'product'],
                name='unique_wishlist_user_product',
            ),
        ]

    def __str__(self):
        return f"{self.user} → {self.product.name}"
