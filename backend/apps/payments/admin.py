from django.contrib import admin
from .models import Transaction, WebhookEvent


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_id', 'order', 'user_email', 'amount',
        'payment_method', 'status', 'created_at',
    )
    list_filter = ('status', 'payment_method', 'payment_gateway', 'created_at')
    search_fields = (
        'id', 'razorpay_order_id', 'razorpay_payment_id',
        'transaction_id', 'order__id', 'order__user__email',
    )
    readonly_fields = (
        'id', 'order', 'transaction_id',
        'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
        'amount', 'response_payload', 'created_at', 'updated_at',
    )
    list_select_related = ('order', 'order__user')
    ordering = ('-created_at',)

    def user_email(self, obj):
        if obj.order and obj.order.user:
            return obj.order.user.email
        return "—"
    user_email.short_description = 'Customer'
    user_email.admin_order_field = 'order__user__email'

    def get_readonly_fields(self, request, obj=None):
        """Make every field readonly once the transaction has succeeded."""
        if obj and obj.status == 'success':
            return [f.name for f in self.model._meta.fields]
        return self.readonly_fields


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'event_type', 'created_at')
    search_fields = ('event_id', 'event_type')
    readonly_fields = ('id', 'event_id', 'event_type', 'payload_summary', 'created_at')
    ordering = ('-created_at',)
