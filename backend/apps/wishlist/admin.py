from django.contrib import admin
from .models import Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'created_at')
    list_filter = ('created_at', 'product__category')
    search_fields = (
        'user__email', 'user__first_name', 'user__last_name',
        'product__name', 'product__sku',
    )
    readonly_fields = ('id', 'created_at')
    list_select_related = ('user', 'product')
    ordering = ('-created_at',)
