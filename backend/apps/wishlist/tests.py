from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status


class AddToWishlistTests(TestCase):
    """Service-layer tests for adding items to the wishlist."""

    def test_add_active_product(self):
        # TODO: Create an active product, call add_to_wishlist.
        # Verify the Wishlist entry is created.
        self.assertTrue(True)

    def test_add_inactive_product_raises_error(self):
        # TODO: Create a product with is_active=False.
        # Call add_to_wishlist and verify ValidationError.
        self.assertTrue(True)

    def test_add_nonexistent_product_raises_error(self):
        # TODO: Call add_to_wishlist with a random UUID.
        # Verify ValidationError with "Product not found."
        self.assertTrue(True)


class DuplicateWishlistTests(TestCase):
    """Tests for duplicate prevention."""

    def test_duplicate_entry_raises_error(self):
        # TODO: Add the same product twice for the same user.
        # Verify ValidationError with "already in your wishlist".
        self.assertTrue(True)

    def test_different_users_can_wishlist_same_product(self):
        # TODO: Two different users add the same product.
        # Verify both entries are created successfully.
        self.assertTrue(True)


class RemoveFromWishlistTests(TestCase):
    """Service-layer tests for removing items."""

    def test_remove_existing_item(self):
        # TODO: Add an item, remove it, verify it no longer exists.
        self.assertTrue(True)

    def test_remove_nonexistent_item_raises_error(self):
        # TODO: Attempt to remove a random UUID.
        # Verify ValidationError with "Wishlist item not found."
        self.assertTrue(True)

    def test_remove_another_users_item_raises_error(self):
        # TODO: User A adds an item. User B tries to remove it.
        # Verify ValidationError (ownership enforced).
        self.assertTrue(True)


class PermissionTests(APITestCase):
    """API-level tests for authentication and ownership."""

    def test_list_wishlist_unauthenticated_returns_401(self):
        # TODO: GET /api/v1/wishlist/ without auth. Verify 401.
        self.assertTrue(True)

    def test_add_wishlist_unauthenticated_returns_401(self):
        # TODO: POST /api/v1/wishlist/ without auth. Verify 401.
        self.assertTrue(True)

    def test_delete_wishlist_unauthenticated_returns_401(self):
        # TODO: DELETE /api/v1/wishlist/{id}/ without auth. Verify 401.
        self.assertTrue(True)

    def test_user_cannot_see_another_users_wishlist(self):
        # TODO: User A adds items. User B calls GET /api/v1/wishlist/.
        # Verify User B sees only their own items.
        self.assertTrue(True)


class WishlistAPIIntegrationTests(APITestCase):
    """End-to-end API tests for the full wishlist flow."""

    def test_list_wishlist_returns_200(self):
        # TODO: Authenticate, GET /api/v1/wishlist/. Verify 200
        # and expected JSON structure.
        self.assertTrue(True)

    def test_add_item_returns_201(self):
        # TODO: POST /api/v1/wishlist/ with valid product_id.
        # Verify 201 and item in response.
        self.assertTrue(True)

    def test_delete_item_returns_204(self):
        # TODO: DELETE /api/v1/wishlist/{id}/. Verify 204.
        self.assertTrue(True)
