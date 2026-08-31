"""
apps.payments.services
~~~~~~~~~~~~~~~~~~~~~~
Business logic for Razorpay online payments and Cash on Delivery.

All amount calculations are derived from the Order — never from the frontend.
"""

import logging
import hashlib
import hmac
from decimal import Decimal

import razorpay
import razorpay.errors
from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.orders.models import Order
from .models import Transaction, WebhookEvent

logger = logging.getLogger('api.errors')

# ── Razorpay client (lazy singleton) ──────────────────────────────────────────

_razorpay_client = None


def _get_razorpay_client():
    """Return a lazily-initialised Razorpay client."""
    global _razorpay_client
    if _razorpay_client is None:
        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET
        if not key_id or not key_secret:
            raise ValidationError({"payment": "Razorpay is not configured on this server."})
        _razorpay_client = razorpay.Client(auth=(key_id, key_secret))
    return _razorpay_client


# ── Constants ─────────────────────────────────────────────────────────────────

COD_MAX_LIMIT = getattr(settings, 'COD_MAX_LIMIT', Decimal('50000.00'))
CURRENCY = 'INR'


# ── Helpers ───────────────────────────────────────────────────────────────────

def _validate_order_for_payment(user, order_id):
    """
    Shared validation: order must exist, belong to the user,
    be in 'pending' status, not already be paid, have total > 0,
    and contain no zero-price (Price on Request) items.
    """
    try:
        order = Order.objects.get(id=order_id, user=user)
    except Order.DoesNotExist:
        raise ValidationError({"order": "Order not found."})

    if order.status != 'pending':
        raise ValidationError({"order": f"Cannot initiate payment for an order with status '{order.status}'."})

    if order.is_paid or order.transactions.filter(status='success').exists():
        raise ValidationError({"order": "This order has already been paid."})

    if order.total_amount <= Decimal('0.00'):
        raise ValidationError({"order": "Cannot pay for orders with ₹0 total amount."})

    if order.items.filter(unit_price__lte=Decimal('0.00')).exists():
        raise ValidationError({"order": "Order contains Price on Request items and cannot be paid online."})

    return order


# ── Razorpay: Create ─────────────────────────────────────────────────────────

@transaction.atomic
def create_razorpay_order(user, order_id):
    """
    Creates a Razorpay order and a pending Transaction attempt record.
    Preserves payment attempt history non-destructively for retries.

    Returns a dict the frontend needs to open the Razorpay checkout:
        razorpay_order_id, key_id, amount (paise), currency, order_id, order_number, customer
    """
    order = _validate_order_for_payment(user, order_id)

    # Exact amount in paise (calculated strictly with Decimal from backend order)
    amount_paise = int((order.total_amount * Decimal("100")).quantize(Decimal("1")))

    client = _get_razorpay_client()

    customer_name = ""
    if order.shipping_address and order.shipping_address.full_name:
        customer_name = order.shipping_address.full_name
    else:
        customer_name = f"{user.first_name} {user.last_name}".strip()

    customer_contact = ""
    if order.shipping_address and order.shipping_address.phone:
        customer_contact = str(order.shipping_address.phone)
    elif hasattr(user, 'phone') and user.phone:
        customer_contact = str(user.phone)

    notes = {
        'order_id': str(order.id),
        'order_number': str(order.tracking_number or str(order.id)[:8]),
        'customer_email': str(user.email),
    }

    try:
        rz_order = client.order.create({
            'amount': amount_paise,
            'currency': CURRENCY,
            'receipt': str(order.id),
            'payment_capture': 1,  # auto-capture
            'notes': notes,
        })
    except Exception as exc:
        logger.error("Razorpay order creation failed: %s", exc)
        raise ValidationError({"payment": "Payment gateway error. Please try again."})

    # Create a new Transaction record for this attempt, preserving attempt history
    txn = Transaction.objects.create(
        order=order,
        razorpay_order_id=rz_order['id'],
        payment_gateway='razorpay',
        payment_method='UPI',
        status='pending',
        amount=order.total_amount,
        response_payload=rz_order,
    )

    return {
        'razorpay_order_id': rz_order['id'],
        'key_id': settings.RAZORPAY_KEY_ID,
        'amount': amount_paise,
        'currency': CURRENCY,
        'order_id': str(order.id),
        'order_number': order.tracking_number or str(order.id)[:8],
        'customer': {
            'name': customer_name,
            'email': user.email,
            'contact': customer_contact,
        },
    }


# ── Razorpay: Verify ─────────────────────────────────────────────────────────

def verify_razorpay_payment(user, razorpay_payment_id, razorpay_signature, razorpay_order_id=None, order_id=None):
    """
    Verify the Razorpay payment signature and confirm payment capture.

    Safety rules:
    1. The authoritative razorpay_order_id is retrieved from the server's own DB record,
       never trusting unverified browser input.
    2. If signature verification fails, the request is rejected as untrusted input
       WITHOUT mutating legitimate pending transaction/order state.
    3. Signature verification alone does not mean paid; payment entity must be fetched
       and verified as 'captured' with exact amount match before order confirmation.
    4. Successful confirmation is atomic and idempotent.
    """
    txn_qs = Transaction.objects.select_related('order').filter(
        order__user=user,
        status='pending',
    )
    if razorpay_order_id:
        txn = txn_qs.filter(razorpay_order_id=razorpay_order_id).first()
    elif order_id:
        txn = txn_qs.filter(order_id=order_id).order_by('-created_at').first()
    else:
        txn = None

    if not txn:
        # Check if already verified successfully (idempotent handling)
        already_success = Transaction.objects.select_related('order').filter(
            order__user=user,
            status='success',
            razorpay_payment_id=razorpay_payment_id,
        ).first()
        if already_success:
            return already_success
        raise ValidationError({"payment": "Valid pending transaction not found for this order."})

    server_razorpay_order_id = txn.razorpay_order_id
    if not server_razorpay_order_id:
        raise ValidationError({"payment": "Transaction missing server gateway order reference."})

    client = _get_razorpay_client()

    # 1. Verify signature using SERVER-STORED order ID
    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': server_razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        logger.warning(
            "Razorpay signature verification failed for user=%s, order=%s, payment=%s",
            user.id, txn.order_id, razorpay_payment_id,
        )
        # Untrusted input: DO NOT MUTATE DB TRANSACTION TO FAILED
        raise ValidationError({"payment": "Payment verification failed. Invalid signature."})

    # 2. Verify payment status is captured via Razorpay API (Signature Verified != Paid)
    try:
        payment_entity = client.payment.fetch(razorpay_payment_id)
    except Exception as exc:
        logger.error("Failed to fetch Razorpay payment entity %s: %s", razorpay_payment_id, exc)
        raise ValidationError({"payment": "Unable to verify payment status with gateway. Please try again."})

    if payment_entity.get('order_id') != server_razorpay_order_id:
        logger.error(
            "Payment order ID mismatch: expected %s, got %s",
            server_razorpay_order_id, payment_entity.get('order_id'),
        )
        raise ValidationError({"payment": "Payment order ID mismatch."})

    expected_paise = int((txn.order.total_amount * Decimal("100")).quantize(Decimal("1")))
    if payment_entity.get('amount') != expected_paise:
        logger.error(
            "Payment amount mismatch: expected %s paise, got %s",
            expected_paise, payment_entity.get('amount'),
        )
        raise ValidationError({"payment": "Payment amount mismatch."})

    payment_status = payment_entity.get('status')
    if payment_status != 'captured':
        # If authorized, attempt auto-capture if delayed
        if payment_status == 'authorized':
            try:
                payment_entity = client.payment.capture(razorpay_payment_id, expected_paise, {'currency': CURRENCY})
                payment_status = payment_entity.get('status')
            except Exception as exc:
                logger.error("Payment capture invocation failed for %s: %s", razorpay_payment_id, exc)

        if payment_status != 'captured':
            raise ValidationError({"payment": f"Payment is not in captured state (status: {payment_status})."})

    # 3. Signature verified and payment confirmed captured — atomic DB update
    with transaction.atomic():
        locked_txn = (
            Transaction.objects
            .select_for_update()
            .select_related('order')
            .get(id=txn.id)
        )
        if locked_txn.status == 'success':
            return locked_txn

        locked_order = Order.objects.select_for_update().get(id=locked_txn.order_id)
        if locked_order.status not in ['pending', 'confirmed']:
            raise ValidationError({"payment": f"Cannot complete payment for order with status '{locked_order.status}'."})

        detected_method = _payment_method_from_razorpay(payment_entity.get('method'))

        locked_txn.status = 'success'
        locked_txn.payment_method = detected_method
        locked_txn.razorpay_payment_id = razorpay_payment_id
        locked_txn.razorpay_signature = razorpay_signature
        locked_txn.transaction_id = razorpay_payment_id
        locked_txn.response_payload = payment_entity
        locked_txn.save()

        # Confirm the business order
        locked_order.status = 'confirmed'
        locked_order.save(update_fields=['status', 'updated_at'])

    return locked_txn


# ── Cash on Delivery ──────────────────────────────────────────────────────────

@transaction.atomic
def process_cod(user, order_id):
    """
    Create a COD transaction attempt.

    Validates the order total does not exceed the configurable COD limit.
    Order remains in 'pending' until admin confirms delivery.
    """
    order = _validate_order_for_payment(user, order_id)

    if order.total_amount > COD_MAX_LIMIT:
        raise ValidationError({
            "payment": f"Cash on Delivery is not available for orders above ₹{COD_MAX_LIMIT}."
        })

    txn = Transaction.objects.create(
        order=order,
        payment_method='COD',
        payment_gateway='cod',
        status='pending',
        amount=order.total_amount,
        transaction_id=None,
        razorpay_order_id=None,
        razorpay_payment_id=None,
        razorpay_signature=None,
        response_payload=None,
    )

    return txn


# ── Read ──────────────────────────────────────────────────────────────────────

def get_transaction_detail(user, transaction_id):
    """Return a single transaction belonging to the user."""
    try:
        return (
            Transaction.objects
            .select_related('order')
            .get(id=transaction_id, order__user=user)
        )
    except Transaction.DoesNotExist:
        raise ValidationError({"transaction": "Transaction not found."})


def verify_razorpay_webhook_signature(payload, signature):
    """Validate Razorpay's HMAC on the exact raw request body."""
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _payment_method_from_razorpay(value):
    return {
        'upi': 'UPI', 'card': 'CARD', 'netbanking': 'NETBANKING', 'wallet': 'WALLET',
    }.get((value or '').lower(), 'CARD')


@transaction.atomic
def process_razorpay_webhook(event, event_id=None):
    """
    Apply captured/failed events safely with event deduplication.
    Duplicate deliveries or out-of-order deliveries are handled idempotently.
    """
    # Event deduplication using WebhookEvent
    if event_id:
        created = WebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={
                'event_type': event.get('event', 'unknown'),
                'payload_summary': {
                    'payment_id': event.get('payload', {}).get('payment', {}).get('entity', {}).get('id'),
                    'order_id': event.get('payload', {}).get('payment', {}).get('entity', {}).get('order_id'),
                },
            }
        )[1]
        if not created:
            logger.info("Ignoring duplicate Razorpay webhook event %s", event_id)
            return

    event_name = event.get('event')
    payment = event.get('payload', {}).get('payment', {}).get('entity', {})
    razorpay_order_id = payment.get('order_id')
    if not razorpay_order_id:
        return

    try:
        txn = Transaction.objects.select_for_update().select_related('order').filter(
            razorpay_order_id=razorpay_order_id,
            payment_gateway='razorpay',
        ).first()
    except Transaction.DoesNotExist:
        logger.warning('Ignoring Razorpay webhook for an unknown order.')
        return

    if not txn:
        logger.warning('Ignoring Razorpay webhook for an unknown transaction: %s', razorpay_order_id)
        return

    if event_name == 'payment.captured':
        # A duplicate captured event or a later failed event must never undo success.
        if txn.status == 'success':
            return
        expected_paise = int((txn.amount * Decimal("100")).quantize(Decimal("1")))
        if payment.get('amount') is not None and payment['amount'] != expected_paise:
            logger.error('Ignoring Razorpay webhook with unexpected payment amount %s (expected %s).', payment.get('amount'), expected_paise)
            return
        txn.status = 'success'
        txn.payment_method = _payment_method_from_razorpay(payment.get('method'))
        txn.razorpay_payment_id = payment.get('id') or txn.razorpay_payment_id
        txn.transaction_id = txn.razorpay_payment_id
        txn.response_payload = {'event': event_name, 'payment_id': txn.razorpay_payment_id}
        txn.save()

        if txn.order.status == 'pending':
            txn.order.status = 'confirmed'
            txn.order.save(update_fields=['status', 'updated_at'])

    elif event_name == 'payment.failed' and txn.status != 'success':
        txn.status = 'failed'
        txn.razorpay_payment_id = payment.get('id') or txn.razorpay_payment_id
        txn.response_payload = {'event': event_name, 'payment_id': txn.razorpay_payment_id}
        txn.save(update_fields=['status', 'razorpay_payment_id', 'response_payload', 'updated_at'])
