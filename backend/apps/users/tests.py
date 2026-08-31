from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address

User = get_user_model()

@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='http://testserver',
)
class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='customer@example.com',
            password='OriginalPassword123!',
            first_name='Customer',
            last_name='Example',
        )
        self.client = APIClient()

    def test_reset_otp_is_emailed_and_can_only_be_used_once(self):
        response = self.client.post('/api/v1/auth/password/forgot/', {'email': self.user.email}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        otp = mail.outbox[0].body.split('code is: ')[1].splitlines()[0]

        response = self.client.post(
            '/api/v1/auth/password/reset/',
            {'email': self.user.email, 'otp': otp, 'new_password': 'NewSecurePassword123!'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecurePassword123!'))

        response = self.client.post(
            '/api/v1/auth/password/reset/',
            {'email': self.user.email, 'otp': otp, 'new_password': 'AnotherSecurePassword123!'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_reset_request_does_not_disclose_unknown_email_addresses(self):
        response = self.client.post('/api/v1/auth/password/forgot/', {'email': 'unknown@example.com'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_change_revokes_existing_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(self.user)
        response = self.client.post(
            '/api/v1/auth/password/change/',
            {'old_password': 'OriginalPassword123!', 'new_password': 'ChangedSecurePassword123!'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)

        self.client.logout()
        response = self.client.post('/api/v1/auth/refresh/', {'refresh': str(refresh)}, format='json')
        self.assertEqual(response.status_code, 401)


class AddressOwnershipTests(TestCase):
    """Changing an address UUID must never expose another customer's data."""

    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@example.com', password='OwnerPassword123!', first_name='Owner', last_name='Example'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com', password='OtherPassword123!', first_name='Other', last_name='Example'
        )
        self.address = Address.objects.create(
            user=self.owner,
            full_name='Owner Example', phone='+919876543210', house_no='1', street='Private Street',
            city='Hyderabad', state='Telangana', pincode='500001', country='India',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.other_user)

    def test_other_customer_cannot_read_or_modify_address_by_uuid(self):
        detail_url = f'/api/v1/auth/addresses/{self.address.id}/'
        self.assertEqual(self.client.get(detail_url).status_code, 404)
        self.assertEqual(self.client.patch(detail_url, {'city': 'Changed'}, format='json').status_code, 404)
        self.address.refresh_from_db()
        self.assertEqual(self.address.city, 'Hyderabad')
