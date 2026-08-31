from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('id', 'unit_price', 'created_at', 'updated_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'is_active', 'item_count', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    list_select_related = ('user',)
    inlines = [CartItemInline]

    @admin.display(description='Items')
    def item_count(self, obj):
        return obj.items.count()


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'get_user', 'product', 'quantity',
        'unit_price', 'subtotal', 'created_at',
    )
    list_filter = ('created_at', 'cart__is_active')
    search_fields = ('product__name', 'product__sku', 'cart__user__email')
    readonly_fields = ('id', 'unit_price', 'created_at', 'updated_at')
    list_select_related = ('cart__user', 'product')

    @admin.display(description='User', ordering='cart__user__email')
    def get_user(self, obj):
        return obj.cart.user.email
