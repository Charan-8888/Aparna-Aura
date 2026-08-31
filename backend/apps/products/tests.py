from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from apps.products.models import Category, Product

class ProductModuleTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Earrings', slug='earrings')
        self.product = Product.objects.create(
            name='Kundan Studs', slug='kundan-studs', sku='STUD-100',
            price=Decimal('1200.00'), stock=10, category=self.category, is_active=True
        )

    def test_product_str_and_properties(self):
        self.assertEqual(str(self.product), 'Kundan Studs')
        self.assertEqual(self.product.price, Decimal('1200.00'))


class ProductAPITests(APITestCase):
    def setUp(self):
        self.earrings_cat = Category.objects.create(name='Earrings', slug='earrings')
        self.necklaces_cat = Category.objects.create(name='Necklace Sets', slug='necklace-sets')
        
        self.prod1 = Product.objects.create(
            name='Temple Earrings', slug='temple-earrings', sku='EAR-01',
            price=Decimal('0.00'), stock=5, category=self.earrings_cat, is_active=True
        )
        self.prod2 = Product.objects.create(
            name='Lakshmi Heritage Set', slug='lakshmi-set', sku='SET-01',
            price=Decimal('999.00'), stock=2, category=self.necklaces_cat, is_active=True
        )

    def test_list_products_api(self):
        res = self.client.get('/api/v1/products/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)
        self.assertGreaterEqual(res.data['count'], 2)

    def test_smart_category_filter_necklaces(self):
        res = self.client.get('/api/v1/products/?category=necklaces')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should return set from necklace-sets via smart aliasing
        self.assertGreaterEqual(res.data['count'], 1)

    def test_search_products_api(self):
        res = self.client.get('/api/v1/products/?search=Lakshmi')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)

    def test_product_detail_api(self):
        res = self.client.get(f'/api/v1/products/{self.prod2.slug}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'Lakshmi Heritage Set')
        self.assertEqual(res.data['price'], '999.00')
