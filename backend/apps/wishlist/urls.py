from django.urls import path
from .views import WishlistView, WishlistItemDetailView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist-list'),
    path('<uuid:item_id>/', WishlistItemDetailView.as_view(), name='wishlist-detail'),
]
