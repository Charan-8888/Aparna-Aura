from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'unit_price')
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'total_amount', 'payment_method_display', 'payment_status_display', 'status_badge', 'created_at')
    list_filter = ('status', 'transactions__status', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'id')
    readonly_fields = ('user', 'subtotal', 'tax_amount', 'shipping_fee', 'discount_amount', 'total_amount', 'shipping_address', 'billing_address', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'shipping_address', 'billing_address').prefetch_related('transactions')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Customer'
    user_email.admin_order_field = 'user__email'

    def payment_method_display(self, obj):
        txn = obj.latest_transaction
        if txn:
            return txn.get_payment_method_display()
        return "—"
    payment_method_display.short_description = 'Payment Method'

    def payment_status_display(self, obj):
        txn = obj.latest_transaction
        if txn:
            status = txn.status
            color_map = {'success': 'badge-success', 'pending': 'badge-warning', 'failed': 'badge-danger', 'abandoned': 'badge-neutral'}
            css_class = color_map.get(status, 'badge-neutral')
            return format_html('<span class="admin-status-badge {}">{}</span>', css_class, txn.get_status_display())
        return "—"
    payment_status_display.short_description = 'Payment Status'

    def status_badge(self, obj):
        status_colors = {
            'pending': 'badge-warning',
            'confirmed': 'badge-info',
            'processing': 'badge-info',
            'packed': 'badge-neutral',
            'shipped': 'badge-neutral',
            'delivered': 'badge-success',
            'cancelled': 'badge-danger',
            'refunded': 'badge-danger'
        }
        css_class = status_colors.get(obj.status, 'badge-neutral')
        return format_html('<span class="admin-status-badge {}">{}</span>', css_class, obj.get_status_display())
    status_badge.short_description = 'Order Status'

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status in ['cancelled', 'delivered', 'refunded']:
            return [f.name for f in self.model._meta.fields]
        return self.readonly_fields

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product', 'quantity', 'unit_price')
    search_fields = ('order__id', 'product__name')
    readonly_fields = ('order', 'product', 'quantity', 'unit_price')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order', 'product')
