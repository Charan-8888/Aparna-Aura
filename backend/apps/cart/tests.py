from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.products.models import Category, Product
from apps.cart.models import Cart, CartItem
from apps.cart.services import (
    add_item_to_cart, update_item_quantity, remove_item_from_cart,
    clear_cart, calculate_cart_totals
)

User = get_user_model()

class CartModelTests(TestCase):
    """Unit tests for Cart and CartItem models."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='cartuser@example.com', password='Password123!', first_name='Cart', last_name='User'
        )
        self.category = Category.objects.create(name='Rings', slug='rings')
        self.product = Product.objects.create(
            name='Gold Ring', slug='gold-ring', sku='RING-01',
            price=Decimal('1500.00'), stock=10, category=self.category
        )

    def test_cart_creation(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.user, self.user)
        self.assertTrue(cart.is_active)

    def test_cart_str_representation(self):
        cart = Cart.objects.create(user=self.user)
        self.assertIn("Cart (active)", str(cart))

    def test_cart_item_subtotal_calculation(self):
        cart = Cart.objects.create(user=self.user)
        item = CartItem.objects.create(
            cart=cart, product=self.product, quantity=3, unit_price=Decimal('1500.00')
        )
        self.assertEqual(item.subtotal, Decimal('4500.00'))


class CartServiceTests(TestCase):
    """Service-layer tests for cart management."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='cartservice@example.com', password='Password123!', first_name='Service', last_name='User'
        )
        self.category = Category.objects.create(name='Earrings', slug='earrings')
        self.product = Product.objects.create(
            name='Gold Studs', slug='gold-studs', sku='STUD-01',
            price=Decimal('2000.00'), stock=5, category=self.category, is_active=True
        )
        self.inactive_product = Product.objects.create(
            name='Inactive Studs', slug='inactive-studs', sku='STUD-02',
            price=Decimal('2000.00'), stock=5, category=self.category, is_active=False
        )

    def test_add_item_creates_cart_and_item(self):
        item = add_item_to_cart(self.user, self.product.id, quantity=2)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.unit_price, Decimal('2000.00'))
        self.assertEqual(Cart.objects.filter(user=self.user, is_active=True).count(), 1)

    def test_add_existing_product_increments_quantity(self):
        add_item_to_cart(self.user, self.product.id, quantity=1)
        item = add_item_to_cart(self.user, self.product.id, quantity=2)
        self.assertEqual(item.quantity, 3)

    def test_add_inactive_product_raises_error(self):
        with self.assertRaises(ValidationError):
            add_item_to_cart(self.user, self.inactive_product.id, quantity=1)

    def test_add_quantity_exceeding_stock_raises_error(self):
        with self.assertRaises(ValidationError):
            add_item_to_cart(self.user, self.product.id, quantity=10)

    def test_update_item_quantity(self):
        item = add_item_to_cart(self.user, self.product.id, quantity=1)
        updated = update_item_quantity(self.user, item.id, quantity=4)
        self.assertEqual(updated.quantity, 4)

    def test_remove_item(self):
        item = add_item_to_cart(self.user, self.product.id, quantity=1)
        remove_item_from_cart(self.user, item.id)
        self.assertFalse(CartItem.objects.filter(id=item.id).exists())

    def test_clear_cart_removes_all_items(self):
        add_item_to_cart(self.user, self.product.id, quantity=1)
        clear_cart(self.user)
        self.assertEqual(CartItem.objects.filter(cart__user=self.user).count(), 0)

    def test_totals_calculation(self):
        add_item_to_cart(self.user, self.product.id, quantity=2)
        cart = Cart.objects.get(user=self.user, is_active=True)
        totals = calculate_cart_totals(cart)
        self.assertEqual(totals['subtotal'], Decimal('4000.00'))
        self.assertEqual(totals['total_items'], 2)


class CartAPITests(APITestCase):
    """API-level tests for cart endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='cartapi@example.com', password='Password123!', first_name='API', last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='otherapi@example.com', password='Password123!', first_name='Other', last_name='User'
        )
        self.category = Category.objects.create(name='Bangles', slug='bangles')
        self.product = Product.objects.create(
            name='Gold Bangle', slug='gold-bangle', sku='BAN-01',
            price=Decimal('5000.00'), stock=10, category=self.category, is_active=True
        )

    def test_unauthenticated_cart_access_fails(self):
        res = self.client.get('/api/v1/cart/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_cart_flow(self):
        self.client.force_authenticate(user=self.user)
        
        # 1. Get cart
        res = self.client.get('/api/v1/cart/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # 2. Add item
        add_res = self.client.post('/api/v1/cart/items/', {
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(add_res.status_code, status.HTTP_201_CREATED)

        # 3. User B cannot modify User A's cart
        self.client.force_authenticate(user=self.other_user)
        item_id = add_res.data['id']
        del_res = self.client.delete(f'/api/v1/cart/items/{item_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_400_BAD_REQUEST)
