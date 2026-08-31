from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CartSerializer,
    CartItemSerializer,
    AddCartItemSerializer,
    UpdateCartItemSerializer,
)
from .services import (
    get_cart_with_items,
    add_item_to_cart,
    update_item_quantity,
    remove_item_from_cart,
    clear_cart,
    calculate_cart_totals,
)


class CartDetailView(APIView):
    """
    GET /cart/
    Return the complete active cart with items and computed totals.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_cart_with_items(request.user)
        totals = calculate_cart_totals(cart)

        # Inject totals onto the cart instance so the serializer can read them.
        cart.total_items = totals["total_items"]
        cart.subtotal = totals["subtotal"]
        cart.estimated_tax = totals["estimated_tax"]
        cart.estimated_shipping = totals["estimated_shipping"]
        cart.grand_total = totals["grand_total"]

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemAddView(APIView):
    """
    POST /cart/items/
    Add an item to the cart (or increase its quantity if already present).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = add_item_to_cart(
            user=request.user,
            product_id=serializer.validated_data['product_id'],
            quantity=serializer.validated_data['quantity'],
        )
        output = CartItemSerializer(item)
        return Response(output.data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """
    PATCH  /cart/items/{id}/  — update quantity
    DELETE /cart/items/{id}/  — remove item
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = update_item_quantity(
            user=request.user,
            item_id=item_id,
            quantity=serializer.validated_data['quantity'],
        )
        output = CartItemSerializer(item)
        return Response(output.data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        remove_item_from_cart(user=request.user, item_id=item_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartClearView(APIView):
    """
    DELETE /cart/clear/
    Remove every item from the active cart.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        clear_cart(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
