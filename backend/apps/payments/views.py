import json

from django.conf import settings
from django.http import HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from core.responses import success_response, created_response
from .serializers import (
    RazorpayCreateSerializer,
    RazorpayVerifySerializer,
    CODSerializer,
    TransactionSerializer,
)
from .services import (
    create_razorpay_order,
    verify_razorpay_payment,
    process_cod,
    get_transaction_detail,
    process_razorpay_webhook,
    verify_razorpay_webhook_signature,
)


class RazorpayCreateView(APIView):
    """
    POST /payments/create/
    Create a Razorpay order for the given Order ID.
    Returns the data needed by the frontend to open Razorpay checkout.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment_create'

    def post(self, request):
        serializer = RazorpayCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = create_razorpay_order(
            user=request.user,
            order_id=serializer.validated_data['order_id'],
        )
        return created_response(data=result, message="Razorpay order created.")


class RazorpayVerifyView(APIView):
    """
    POST /payments/verify/
    Verify the Razorpay payment signature and capture state.
    Uses the server-stored Razorpay Order ID as the single source of truth.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment_verify'

    def post(self, request):
        serializer = RazorpayVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        txn = verify_razorpay_payment(
            user=request.user,
            razorpay_order_id=serializer.validated_data.get('razorpay_order_id'),
            razorpay_payment_id=serializer.validated_data['razorpay_payment_id'],
            razorpay_signature=serializer.validated_data['razorpay_signature'],
            order_id=serializer.validated_data.get('order_id'),
        )
        output = TransactionSerializer(txn)
        return success_response(data=output.data, message="Payment verified successfully.")


class CODCreateView(APIView):
    """
    POST /payments/cod/
    Select Cash on Delivery for the given Order.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'payment_cod'

    def post(self, request):
        serializer = CODSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        txn = process_cod(
            user=request.user,
            order_id=serializer.validated_data['order_id'],
        )
        output = TransactionSerializer(txn)
        return created_response(data=output.data, message="Cash on Delivery selected.")


class TransactionDetailView(APIView):
    """
    GET /payments/{transaction_id}/
    Retrieve transaction details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_id):
        txn = get_transaction_detail(
            user=request.user,
            transaction_id=transaction_id,
        )
        output = TransactionSerializer(txn)
        return success_response(data=output.data, message="Transaction retrieved.")


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    """
    Razorpay server-to-server webhook; accepts only valid signed payloads.
    Deduplicates events via X-Razorpay-Event-Id and executes idempotent state transitions.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        event_id = request.headers.get('X-Razorpay-Event-Id', '')
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            return HttpResponseBadRequest('Webhook is not configured.')
        if not verify_razorpay_webhook_signature(request.body, signature):
            return HttpResponseBadRequest('Invalid webhook signature.')

        try:
            event = json.loads(request.body.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return HttpResponseBadRequest('Invalid webhook payload.')

        event_id = event_id or event.get('id')
        process_razorpay_webhook(event, event_id=event_id)
        # Razorpay requires a quick 2xx response. Processing is idempotent.
        return success_response(message='Webhook accepted.')
