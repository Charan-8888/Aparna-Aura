from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import WishlistSerializer, AddWishlistSerializer
from .services import get_user_wishlist, add_to_wishlist, remove_from_wishlist


class WishlistView(APIView):
    """
    GET  /wishlist/     — list all wishlist items
    POST /wishlist/     — add a product to the wishlist
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = get_user_wishlist(request.user)
        serializer = WishlistSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddWishlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = add_to_wishlist(
            user=request.user,
            product_id=serializer.validated_data['product_id'],
        )
        output = WishlistSerializer(item)
        return Response(output.data, status=status.HTTP_201_CREATED)


class WishlistItemDetailView(APIView):
    """
    DELETE /wishlist/{id}/  — remove a wishlist item
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        remove_from_wishlist(user=request.user, item_id=item_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
