from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.products.models import Category, Product
from apps.users.models import Address
from apps.cart.services import add_item_to_cart
from apps.orders.models import Order
from apps.orders.services import checkout, cancel_order, release_expired_pending_orders

User = get_user_model()

class OrderServiceTests(TestCase):
    """Service-layer tests for Checkout, Cancellation, and Expired Stock Release."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='orderservice@example.com', password='Password123!', first_name='Order', last_name='Service'
        )
        self.other_user = User.objects.create_user(
            email='otherorder@example.com', password='Password123!', first_name='Other', last_name='User'
        )
        self.category = Category.objects.create(name='Necklaces', slug='necklaces')
        self.product = Product.objects.create(
            name='Royal Necklace', slug='royal-necklace', sku='NECK-01',
            price=Decimal('25000.00'), stock=5, category=self.category, is_active=True
        )
        self.zero_price_product = Product.objects.create(
            name='Price Pending Necklace', slug='pending-necklace', sku='NECK-02',
            price=Decimal('0.00'), stock=5, category=self.category, is_active=True
        )
        self.address = Address.objects.create(
            user=self.user, full_name='Order Service', phone='9876543210',
            house_no='123', street='Main St', city='Hyderabad', state='Telangana', pincode='500001'
        )

    def test_checkout_reduces_stock_and_creates_order(self):
        add_item_to_cart(self.user, self.product.id, quantity=2)
        order = checkout(self.user, self.address.id)
        
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.items.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3) # 5 - 2 = 3

    def test_checkout_zero_price_product_raises_validation_error(self):
        # Adding zero-price product to cart is blocked
        with self.assertRaises(ValidationError):
            add_item_to_cart(self.user, self.zero_price_product.id, quantity=1)

    def test_cancel_order_restores_stock(self):
        add_item_to_cart(self.user, self.product.id, quantity=2)
        order = checkout(self.user, self.address.id)
        
        cancelled = cancel_order(self.user, order.id)
        self.assertEqual(cancelled.status, 'cancelled')
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5) # Restored back to 5

    def test_release_expired_pending_orders_restores_stock(self):
        add_item_to_cart(self.user, self.product.id, quantity=2)
        order = checkout(self.user, self.address.id)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

        # Backdate order created_at to 40 minutes ago
        Order.objects.filter(id=order.id).update(created_at=timezone.now() - timedelta(minutes=40))

        released = release_expired_pending_orders(timeout_minutes=30)
        self.assertEqual(released, 1)

        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5) # Restored to 5


class OrderAPITests(APITestCase):
    """API security & functional tests for Orders."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='orderapi@example.com', password='Password123!', first_name='Order', last_name='API'
        )
        self.other_user = User.objects.create_user(
            email='otherapi@example.com', password='Password123!', first_name='Other', last_name='User'
        )
        self.category = Category.objects.create(name='Pendants', slug='pendants')
        self.product = Product.objects.create(
            name='Gold Pendant', slug='gold-pendant', sku='PEND-01',
            price=Decimal('8000.00'), stock=10, category=self.category, is_active=True
        )
        self.address = Address.objects.create(
            user=self.user, full_name='Order API', phone='9876543210',
            house_no='456', street='Second St', city='Bangalore', state='Karnataka', pincode='560001'
        )

    def test_unauthenticated_orders_access_fails(self):
        res = self.client.get('/api/v1/orders/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_other_user_cannot_access_or_cancel_order(self):
        self.client.force_authenticate(user=self.user)
        add_item_to_cart(self.user, self.product.id, quantity=1)
        order = checkout(self.user, self.address.id)

        # User B attempts access
        self.client.force_authenticate(user=self.other_user)
        res_detail = self.client.get(f'/api/v1/orders/{order.id}/')
        self.assertEqual(res_detail.status_code, status.HTTP_404_NOT_FOUND)

        res_cancel = self.client.post(f'/api/v1/orders/{order.id}/cancel/', {}, format='json')
        self.assertEqual(res_cancel.status_code, status.HTTP_400_BAD_REQUEST)
