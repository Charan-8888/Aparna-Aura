from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.products.models import Product
from .models import Cart, CartItem


# ── Tax / Shipping constants ──────────────────────────────────────────────────
TAX_RATE = Decimal("0.03")             # 3 % GST placeholder
FREE_SHIPPING_THRESHOLD = Decimal("999.00")
FLAT_SHIPPING_FEE = Decimal("49.00")


# ── Cart retrieval / creation ─────────────────────────────────────────────────

def get_or_create_cart(user):
    """
    Return the user's active cart.
    Creates one lazily on first access.
    """
    cart, _created = Cart.objects.get_or_create(
        user=user,
        is_active=True,
    )
    return cart


def get_cart_with_items(user):
    """
    Return the active cart with all items eagerly loaded.

    Uses ``select_related`` for product → category and
    ``prefetch_related`` for product images to avoid N+1 queries.
    """
    cart = get_or_create_cart(user)
    cart.prefetched_items = (
        CartItem.objects
        .filter(cart=cart)
        .select_related('product', 'product__category')
        .prefetch_related('product__images')
    )
    return cart


# ── Validation helpers ────────────────────────────────────────────────────────

def _validate_product_for_cart(product):
    """Shared validation: product must be active, in stock, and have a valid price."""
    if not product.is_active:
        raise ValidationError({"product": "This product is currently unavailable."})
    if product.price <= Decimal("0.00"):
        raise ValidationError({"product": f"Product '{product.name}' is Price on Request and cannot be added to cart."})
    if product.stock == 0:
        raise ValidationError({"product": "This product is out of stock."})


# ── Item mutations ────────────────────────────────────────────────────────────

@transaction.atomic
def add_item_to_cart(user, product_id, quantity=1):
    """
    Add a product to the user's active cart.

    • Creates the cart if it does not exist.
    • If the product already exists in the cart, *increases* the quantity.
    • Validates product availability, stock limits, and minimum quantity.
    • Snapshots the current product price as ``unit_price``.
    """
    if quantity < 1:
        raise ValidationError({"quantity": "Quantity must be at least 1."})

    try:
        product = Product.objects.select_for_update().get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError({"product": "Product not found."})

    _validate_product_for_cart(product)

    cart = get_or_create_cart(user)

    # If item already exists in cart → update quantity instead of duplicating.
    try:
        item = CartItem.objects.select_for_update().get(cart=cart, product=product)
        new_qty = item.quantity + quantity
        if new_qty > product.stock:
            raise ValidationError({
                "quantity": (
                    f"Only {product.stock} units available "
                    f"(you already have {item.quantity} in your cart)."
                )
            })
        item.quantity = new_qty
        item.save(update_fields=['quantity', 'updated_at'])
    except CartItem.DoesNotExist:
        if quantity > product.stock:
            raise ValidationError({
                "quantity": f"Only {product.stock} units available."
            })
        item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=quantity,
            unit_price=product.price,
        )

    return item


@transaction.atomic
def update_item_quantity(user, item_id, quantity):
    """
    Set the absolute quantity for an existing cart item.

    Re-validates product active status and current stock on every call
    so that inventory changes are respected immediately.
    """
    if quantity < 1:
        raise ValidationError({"quantity": "Quantity must be at least 1."})

    try:
        item = (
            CartItem.objects
            .select_for_update()
            .select_related('product')
            .get(id=item_id, cart__user=user, cart__is_active=True)
        )
    except CartItem.DoesNotExist:
        raise ValidationError({"item": "Cart item not found."})

    # Re-validate product on every update.
    _validate_product_for_cart(item.product)

    if quantity > item.product.stock:
        raise ValidationError({
            "quantity": f"Only {item.product.stock} units available."
        })

    item.quantity = quantity
    item.save(update_fields=['quantity', 'updated_at'])
    return item


def remove_item_from_cart(user, item_id):
    """Delete a single item from the user's active cart."""
    deleted, _ = (
        CartItem.objects
        .filter(id=item_id, cart__user=user, cart__is_active=True)
        .delete()
    )
    if deleted == 0:
        raise ValidationError({"item": "Cart item not found."})


def clear_cart(user):
    """Remove every item from the user's active cart."""
    cart = get_or_create_cart(user)
    cart.items.all().delete()


# ── Calculations ──────────────────────────────────────────────────────────────

def calculate_cart_totals(cart):
    """
    Compute cart-level totals from the (prefetched) items.

    Returns a dict with:
        total_items, subtotal, estimated_tax,
        estimated_shipping, grand_total

    This is the **single source of truth** for all cart calculations.
    """
    items = getattr(cart, 'prefetched_items', cart.items.all())

    total_items = 0
    subtotal = Decimal("0.00")

    for item in items:
        total_items += item.quantity
        subtotal += item.subtotal

    estimated_tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
    estimated_shipping = (
        Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD
        else FLAT_SHIPPING_FEE
    )
    grand_total = subtotal + estimated_tax + estimated_shipping

    return {
        "total_items": total_items,
        "subtotal": subtotal,
        "estimated_tax": estimated_tax,
        "estimated_shipping": estimated_shipping,
        "grand_total": grand_total,
    }
