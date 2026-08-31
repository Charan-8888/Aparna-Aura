from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer, CheckoutSerializer
from .services import checkout, cancel_order
from core.responses import success_response, created_response

class CheckoutView(views.APIView):
    """
    POST /orders/checkout/
    Creates a new order from the active cart.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = checkout(
            user=request.user,
            shipping_address_id=serializer.validated_data['shipping_address_id'],
            billing_address_id=serializer.validated_data.get('billing_address_id')
        )
        
        output = OrderSerializer(order)
        return created_response(data=output.data, message="Order created successfully.")

class OrderListView(generics.ListAPIView):
    """
    GET /orders/
    Lists all orders for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
        
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data, message="Orders retrieved successfully.")

class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /orders/{id}/
    Retrieves a specific order.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product', 'items__product__images')
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(data=serializer.data, message="Order retrieved successfully.")

class OrderCancelView(views.APIView):
    """
    POST /orders/{id}/cancel/
    Cancels a pending or confirmed order.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        order = cancel_order(user=request.user, order_id=id)
        output = OrderSerializer(order)
        return success_response(data=output.data, message="Order cancelled successfully.")
