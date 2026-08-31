from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ProductViewSet

router = SimpleRouter()
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-list'),
    path('', include(router.urls)),
    path('<slug:slug>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='product-detail'),
]
