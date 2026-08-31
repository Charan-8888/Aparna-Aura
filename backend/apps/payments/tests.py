import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from apps.orders.models import Order, OrderItem
from apps.payments.models import Transaction, WebhookEvent
from apps.payments.services import (
    create_razorpay_order,
    process_cod,
    verify_razorpay_payment,
)
from apps.products.models import Category, Product
from apps.users.models import Address
import razorpay.errors

User = get_user_model()


@override_settings(
    RAZORPAY_KEY_ID='rzp_test_1234567890',
    RAZORPAY_KEY_SECRET='test_secret_key_mock',
    RAZORPAY_WEBHOOK_SECRET='test-webhook-secret-that-is-long-enough',
)
class RazorpayOrderCreationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='shopper@example.com',
            password='SecurePassword123!',
            first_name='Aura',
            last_name='Customer',
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='SecurePassword123!',
            first_name='Other',
            last_name='User',
        )
        self.category = Category.objects.create(name='Necklaces', slug='necklaces')
        self.product = Product.objects.create(
            name='Royal Polki Necklace',
            slug='royal-polki-necklace',
            category=self.category,
            price=Decimal('2400.00'),
            stock=10,
            is_active=True,
        )
        self.address = Address.objects.create(
            user=self.user,
            full_name='Aura Customer',
            phone='9876543210',
            house_no='123',
            street='Diamond Road',
            city='Hyderabad',
            state='Telangana',
            pincode='500081',
            country='India',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('2400.00'),
            status='pending',
            shipping_address=self.address,
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            unit_price=Decimal('2400.00'),
        )

    @patch('apps.payments.services._get_razorpay_client')
    def test_create_razorpay_order_exact_amount_paise(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {
            'id': 'order_rzp_mock_123',
            'amount': 240000,
            'currency': 'INR',
        }
        mock_get_client.return_value = mock_client

        result = create_razorpay_order(self.user, self.order.id)

        # Exact amount calculated from order: 2400.00 * 100 = 240000 paise
        self.assertEqual(result['amount'], 240000)
        self.assertEqual(result['currency'], 'INR')
        self.assertEqual(result['razorpay_order_id'], 'order_rzp_mock_123')
        self.assertEqual(result['key_id'], 'rzp_test_1234567890')
        self.assertEqual(result['order_id'], str(self.order.id))
        self.assertEqual(result['customer']['name'], 'Aura Customer')
        self.assertEqual(result['customer']['contact'], '9876543210')

        # Verify transaction attempt record was created in pending state
        txn = self.order.transactions.first()
        self.assertIsNotNone(txn)
        self.assertEqual(txn.razorpay_order_id, 'order_rzp_mock_123')
        self.assertEqual(txn.status, 'pending')
        self.assertEqual(txn.amount, Decimal('2400.00'))

    @patch('apps.payments.services._get_razorpay_client')
    def test_order_ownership_enforcement(self, mock_get_client):
        # User B trying to initiate payment on User A's order must be rejected
        with self.assertRaises(ValidationError):
            create_razorpay_order(self.other_user, self.order.id)

    def test_reject_zero_price_order(self):
        zero_order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('0.00'),
            status='pending',
        )
        with self.assertRaises(ValidationError):
            create_razorpay_order(self.user, zero_order.id)

    def test_reject_order_with_zero_price_items(self):
        zero_item_order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('100.00'),
            status='pending',
        )
        OrderItem.objects.create(
            order=zero_item_order,
            product=self.product,
            quantity=1,
            unit_price=Decimal('0.00'),
        )
        with self.assertRaises(ValidationError):
            create_razorpay_order(self.user, zero_item_order.id)

    def test_reject_already_paid_order(self):
        self.order.status = 'confirmed'
        self.order.save()
        Transaction.objects.create(
            order=self.order,
            amount=Decimal('2400.00'),
            payment_gateway='razorpay',
            status='success',
            razorpay_order_id='order_paid_123',
        )
        with self.assertRaises(ValidationError):
            create_razorpay_order(self.user, self.order.id)

    @patch('apps.payments.services._get_razorpay_client')
    def test_payment_retry_on_unpaid_order_preserves_attempts(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.order.create.side_effect = [
            {'id': 'order_rzp_attempt_1', 'amount': 240000, 'currency': 'INR'},
            {'id': 'order_rzp_attempt_2', 'amount': 240000, 'currency': 'INR'},
        ]
        mock_get_client.return_value = mock_client

        # First attempt
        res1 = create_razorpay_order(self.user, self.order.id)
        self.assertEqual(res1['razorpay_order_id'], 'order_rzp_attempt_1')

        # Retry attempt on the same business order
        res2 = create_razorpay_order(self.user, self.order.id)
        self.assertEqual(res2['razorpay_order_id'], 'order_rzp_attempt_2')

        # Verify BOTH attempts are preserved in history (non-destructive retry)
        attempts = self.order.transactions.all()
        self.assertEqual(attempts.count(), 2)
        order_ids = [a.razorpay_order_id for a in attempts]
        self.assertIn('order_rzp_attempt_1', order_ids)
        self.assertIn('order_rzp_attempt_2', order_ids)


@override_settings(
    RAZORPAY_KEY_ID='rzp_test_1234567890',
    RAZORPAY_KEY_SECRET='test_secret_key_mock',
)
class RazorpayVerificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='verify_user@example.com',
            password='SecurePassword123!',
            first_name='Verify',
            last_name='User',
        )
        self.other_user = User.objects.create_user(
            email='other_verify@example.com',
            password='SecurePassword123!',
            first_name='Other',
            last_name='User',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('1800.00'),
            status='pending',
        )
        self.txn = Transaction.objects.create(
            order=self.order,
            amount=Decimal('1800.00'),
            payment_gateway='razorpay',
            razorpay_order_id='order_verify_test_123',
            status='pending',
        )

    @patch('apps.payments.services._get_razorpay_client')
    def test_verify_payment_success_captured(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = True
        mock_client.payment.fetch.return_value = {
            'id': 'pay_test_999',
            'order_id': 'order_verify_test_123',
            'amount': 180000,
            'status': 'captured',
            'method': 'upi',
        }
        mock_get_client.return_value = mock_client

        txn = verify_razorpay_payment(
            user=self.user,
            razorpay_order_id='order_verify_test_123',
            razorpay_payment_id='pay_test_999',
            razorpay_signature='valid_sig_123',
        )

        self.assertEqual(txn.status, 'success')
        self.assertEqual(txn.razorpay_payment_id, 'pay_test_999')
        self.assertEqual(txn.payment_method, 'UPI')
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'confirmed')

    @patch('apps.payments.services._get_razorpay_client')
    def test_verify_payment_invalid_signature_does_not_mutate_db(self, mock_get_client):
        """
        Invalid signature is untrusted input and must be rejected WITHOUT
        marking the legitimate transaction as failed or mutating the order.
        """
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.side_effect = (
            razorpay.errors.SignatureVerificationError('Invalid signature')
        )
        mock_get_client.return_value = mock_client

        with self.assertRaises(ValidationError):
            verify_razorpay_payment(
                user=self.user,
                razorpay_order_id='order_verify_test_123',
                razorpay_payment_id='pay_test_invalid',
                razorpay_signature='invalid_sig',
            )

        # Crucial security check: Transaction status must remain 'pending' (not 'failed')
        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, 'pending')
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    @patch('apps.payments.services._get_razorpay_client')
    def test_verify_payment_uncaptured_status_rejected(self, mock_get_client):
        """Signature may be valid but if payment is failed/refunded, must not confirm order."""
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = True
        mock_client.payment.fetch.return_value = {
            'id': 'pay_test_failed_gate',
            'order_id': 'order_verify_test_123',
            'amount': 180000,
            'status': 'failed',
            'method': 'upi',
        }
        mock_get_client.return_value = mock_client

        with self.assertRaises(ValidationError):
            verify_razorpay_payment(
                user=self.user,
                razorpay_order_id='order_verify_test_123',
                razorpay_payment_id='pay_test_failed_gate',
                razorpay_signature='valid_sig',
            )

        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, 'pending')
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    @patch('apps.payments.services._get_razorpay_client')
    def test_verify_payment_amount_mismatch_rejected(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = True
        mock_client.payment.fetch.return_value = {
            'id': 'pay_test_tampered',
            'order_id': 'order_verify_test_123',
            'amount': 10000,  # 100 Rs instead of 1800 Rs
            'status': 'captured',
            'method': 'upi',
        }
        mock_get_client.return_value = mock_client

        with self.assertRaises(ValidationError):
            verify_razorpay_payment(
                user=self.user,
                razorpay_order_id='order_verify_test_123',
                razorpay_payment_id='pay_test_tampered',
                razorpay_signature='valid_sig',
            )

    @patch('apps.payments.services._get_razorpay_client')
    def test_verify_payment_ownership_enforcement(self, mock_get_client):
        # User B trying to verify User A's transaction must be rejected
        with self.assertRaises(ValidationError):
            verify_razorpay_payment(
                user=self.other_user,
                razorpay_order_id='order_verify_test_123',
                razorpay_payment_id='pay_test_999',
                razorpay_signature='valid_sig_123',
            )

    def test_verify_already_success_payment_idempotent(self):
        self.txn.status = 'success'
        self.txn.razorpay_payment_id = 'pay_test_999'
        self.txn.save()

        # Idempotent response returns existing successful transaction
        result = verify_razorpay_payment(
            user=self.user,
            razorpay_order_id='order_verify_test_123',
            razorpay_payment_id='pay_test_999',
            razorpay_signature='valid_sig_123',
        )
        self.assertEqual(result.id, self.txn.id)
        self.assertEqual(result.status, 'success')


@override_settings(RAZORPAY_WEBHOOK_SECRET='test-webhook-secret-that-is-long-enough')
class RazorpayWebhookTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='webhook@example.com',
            password='WebhookPassword123!',
            first_name='Webhook',
            last_name='Test',
        )
        self.order = Order.objects.create(user=self.user, total_amount=Decimal('1200.00'))
        self.transaction = Transaction.objects.create(
            order=self.order,
            amount=Decimal('1200.00'),
            payment_gateway='razorpay',
            payment_method='CARD',
            razorpay_order_id='order_webhook_test',
            status='pending',
        )

    def _post_event(self, event_name, event_id='evt_test_101', signature=None):
        payload = json.dumps({
            'event': event_name,
            'id': event_id,
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_webhook_test',
                        'order_id': 'order_webhook_test',
                        'method': 'upi',
                        'amount': 120000,
                    }
                }
            },
        }).encode('utf-8')
        signature = signature or hmac.new(
            b'test-webhook-secret-that-is-long-enough',
            payload,
            hashlib.sha256,
        ).hexdigest()
        return self.client.post(
            '/api/v1/payments/webhook/razorpay/',
            payload,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID=event_id,
        )

    def test_captured_webhook_is_signed_and_idempotent(self):
        # First delivery
        res1 = self._post_event('payment.captured', event_id='evt_test_101')
        self.assertEqual(res1.status_code, 200)

        # Duplicate delivery with same event id
        res2 = self._post_event('payment.captured', event_id='evt_test_101')
        self.assertEqual(res2.status_code, 200)

        self.transaction.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.transaction.status, 'success')
        self.assertEqual(self.transaction.payment_method, 'UPI')
        self.assertEqual(self.order.status, 'confirmed')

        # WebhookEvent record exists
        self.assertTrue(WebhookEvent.objects.filter(event_id='evt_test_101').exists())

    def test_failed_webhook_does_not_overwrite_success(self):
        """Late or out-of-order payment.failed event must never undo captured success."""
        self.transaction.status = 'success'
        self.transaction.save()
        self.order.status = 'confirmed'
        self.order.save()

        res = self._post_event('payment.failed', event_id='evt_test_failed_late')
        self.assertEqual(res.status_code, 200)

        self.transaction.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.transaction.status, 'success')
        self.assertEqual(self.order.status, 'confirmed')

    def test_invalid_webhook_signature_is_rejected(self):
        self.assertEqual(self._post_event('payment.captured', signature='invalid').status_code, 400)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, 'pending')


class CODTests(TestCase):
    """Service-layer tests for Cash on Delivery."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='coduser@example.com',
            password='Password123!',
            first_name='COD',
            last_name='User',
        )

    def test_cod_success(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal('1500.00'), status='pending')
        txn = process_cod(self.user, order.id)
        self.assertEqual(txn.payment_method, 'COD')
        self.assertEqual(txn.status, 'pending')

    def test_cod_exceeds_limit_raises_error(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal('60000.00'), status='pending')
        with self.assertRaises(ValidationError):
            process_cod(self.user, order.id)


class PaymentPermissionTests(APITestCase):
    """API permission tests."""

    def test_create_payment_unauthenticated_returns_401(self):
        res = self.client.post('/api/v1/payments/create/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_verify_payment_unauthenticated_returns_401(self):
        res = self.client.post('/api/v1/payments/verify/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cod_unauthenticated_returns_401(self):
        res = self.client.post('/api/v1/payments/cod/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
