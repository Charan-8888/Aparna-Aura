from django.urls import path
from .views import (
    RazorpayCreateView,
    RazorpayVerifyView,
    CODCreateView,
    TransactionDetailView,
    RazorpayWebhookView,
)

urlpatterns = [
    path('create/', RazorpayCreateView.as_view(), name='payment-create'),
    path('verify/', RazorpayVerifyView.as_view(), name='payment-verify'),
    path('cod/', CODCreateView.as_view(), name='payment-cod'),
    path('webhook/razorpay/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('<uuid:transaction_id>/', TransactionDetailView.as_view(), name='payment-detail'),
]
