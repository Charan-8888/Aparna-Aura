from django.urls import path
from .views import CheckoutView, OrderListView, OrderDetailView, OrderCancelView

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('<uuid:id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<uuid:id>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
]
