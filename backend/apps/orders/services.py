from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError
from decimal import Decimal

from apps.cart.services import get_cart_with_items, calculate_cart_totals
from apps.products.models import Product
from apps.users.models import Address
from .models import Order, OrderItem

@transaction.atomic
def checkout(user, shipping_address_id, billing_address_id=None):
    """
    Creates an Order from the user's active Cart.
    
    1. Validate authenticated user (handled by views/permissions).
    2. Validate active cart exists & is not empty.
    3. Validate stock for every product using select_for_update.
    4. Guard against ₹0 price products (Price on Request).
    5. Validate selected shipping address belongs to the user.
    6. Calculate totals using the Cart service.
    7. Create Order.
    8. Create OrderItems.
    9. Reserve stock by reducing Product.stock.
    10. Deactivate current cart.
    11. Return Order Summary.
    """
    # 2. Validate active cart
    cart = get_cart_with_items(user)
    items = getattr(cart, 'prefetched_items', cart.items.all())
    
    if not items:
        raise ValidationError({"cart": "Your cart is empty. Cannot checkout."})

    # 4. Validate shipping address belongs to user
    try:
        shipping_address = Address.objects.get(id=shipping_address_id, user=user)
    except Address.DoesNotExist:
        raise ValidationError({"shipping_address": "Invalid shipping address."})

    billing_address = shipping_address
    if billing_address_id:
        try:
            billing_address = Address.objects.get(id=billing_address_id, user=user)
        except Address.DoesNotExist:
            raise ValidationError({"billing_address": "Invalid billing address."})

    # 3. Validate stock & 4. Guard against ₹0 products (locking products)
    product_ids = [item.product_id for item in items]
    
    # Lock the products in a consistent order to prevent deadlocks
    products = Product.objects.select_for_update().filter(id__in=product_ids).order_by('id')
    product_map = {p.id: p for p in products}

    for item in items:
        product = product_map.get(item.product_id)
        if not product:
            raise ValidationError({"product": f"Product {item.product.name} no longer exists."})
        if not product.is_active:
            raise ValidationError({"product": f"Product {product.name} is no longer available."})
        if product.price <= Decimal('0.00') or item.unit_price <= Decimal('0.00'):
            raise ValidationError({"price": f"Product '{product.name}' is Price on Request and cannot be purchased directly."})
        if item.quantity > product.stock:
            raise ValidationError({"quantity": f"Only {product.stock} units available for {product.name}."})

    # 5. Calculate totals using Cart service
    totals = calculate_cart_totals(cart)
    if totals['grand_total'] <= Decimal('0.00'):
        raise ValidationError({"grand_total": "Orders with ₹0 total cannot be checked out."})

    # 6. Create Order (Pending state)
    order = Order.objects.create(
        user=user,
        status='pending',
        subtotal=totals['subtotal'],
        tax_amount=totals['estimated_tax'],
        shipping_fee=totals['estimated_shipping'],
        discount_amount=Decimal('0.00'),
        total_amount=totals['grand_total'],
        shipping_address=shipping_address,
        billing_address=billing_address,
    )

    # 7. Create OrderItems & 8. Reserve Stock
    order_items_to_create = []
    products_to_update = []
    
    for item in items:
        order_items_to_create.append(
            OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.unit_price
            )
        )
        
        # Reserve stock
        product = product_map[item.product_id]
        product.stock -= item.quantity
        products_to_update.append(product)

    OrderItem.objects.bulk_create(order_items_to_create)
    Product.objects.bulk_update(products_to_update, ['stock'])

    # 9. Deactivate cart
    cart.is_active = False
    cart.save(update_fields=['is_active'])

    return order

@transaction.atomic
def cancel_order(user, order_id):
    """
    Cancels an order if it is in 'pending' or 'confirmed' status.
    Refunds the stock back to the products.
    """
    try:
        # Lock the order to prevent race conditions during cancellation
        order = Order.objects.select_for_update().get(id=order_id, user=user)
    except Order.DoesNotExist:
        raise ValidationError({"order": "Order not found."})

    if order.status not in ['pending', 'confirmed']:
        raise ValidationError({"status": f"Cannot cancel an order with status '{order.status}'."})

    # Lock products to refund stock
    items = order.items.select_related('product')
    product_ids = [item.product_id for item in items]
    products = Product.objects.select_for_update().filter(id__in=product_ids).order_by('id')
    product_map = {p.id: p for p in products}

    products_to_update = []
    for item in items:
        product = product_map.get(item.product_id)
        if product:
            product.stock += item.quantity
            products_to_update.append(product)

    if products_to_update:
        Product.objects.bulk_update(products_to_update, ['stock'])

    # Update order status
    order.status = 'cancelled'
    order.save(update_fields=['status', 'updated_at'])

    return order

@transaction.atomic
def release_expired_pending_orders(timeout_minutes=30):
    """
    Scans for pending orders older than timeout_minutes whose payment was never completed.
    Restores reserved stock back to products inside transaction.atomic() and marks orders as cancelled.
    Idempotent: ignores orders already cancelled or confirmed.
    """
    cutoff_time = timezone.now() - timedelta(minutes=timeout_minutes)
    
    # Lock matching pending orders
    expired_orders = Order.objects.select_for_update().filter(
        status='pending',
        created_at__lt=cutoff_time
    )

    released_count = 0
    for order in expired_orders:
        items = order.items.select_related('product')
        product_ids = [item.product_id for item in items]
        products = Product.objects.select_for_update().filter(id__in=product_ids).order_by('id')
        product_map = {p.id: p for p in products}

        products_to_update = []
        for item in items:
            product = product_map.get(item.product_id)
            if product:
                product.stock += item.quantity
                products_to_update.append(product)

        if products_to_update:
            Product.objects.bulk_update(products_to_update, ['stock'])

        order.status = 'cancelled'
        order.save(update_fields=['status', 'updated_at'])
        released_count += 1

    return released_count
