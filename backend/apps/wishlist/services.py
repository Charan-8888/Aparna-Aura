from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

from apps.products.models import Product
from .models import Wishlist


def get_user_wishlist(user):
    """
    Return all wishlist items for the given user.

    Uses ``select_related`` for product → category and
    ``prefetch_related`` for product images to avoid N+1 queries.
    """
    return (
        Wishlist.objects
        .filter(user=user)
        .select_related('product', 'product__category')
        .prefetch_related('product__images')
    )


def add_to_wishlist(user, product_id):
    """
    Add a product to the user's wishlist.

    Validates:
    • Product exists.
    • Product is active.
    • Entry does not already exist (duplicate).
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError({"product": "Product not found."})

    if not product.is_active:
        raise ValidationError({"product": "This product is currently unavailable."})

    try:
        item = Wishlist.objects.create(user=user, product=product)
    except IntegrityError:
        raise ValidationError({"product": "This product is already in your wishlist."})

    return item


def remove_from_wishlist(user, item_id):
    """
    Remove a single item from the user's wishlist.

    Returns a proper error if the item does not exist or
    does not belong to the requesting user.
    """
    deleted, _ = Wishlist.objects.filter(id=item_id, user=user).delete()
    if deleted == 0:
        raise ValidationError({"item": "Wishlist item not found."})
