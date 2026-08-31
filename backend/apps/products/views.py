from rest_framework import viewsets, mixins, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsStaffOrAdmin
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, StaffProductSerializer
from .filters import ProductFilter
from .services import get_active_categories, get_active_products

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsStaffOrAdmin()]
        
    def get_queryset(self):
        if self.request.user.is_authenticated and (self.request.user.role in ['staff', 'admin'] or self.request.user.is_staff):
            return Category.objects.all().order_by('display_order')
        return get_active_categories()
    
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'meta_title', 'meta_description']
    ordering_fields = ['price', 'created_at', 'name']

    def get_serializer_class(self):
        user = self.request.user
        if user.is_authenticated and (user.role in ['staff', 'admin'] or user.is_staff):
            return StaffProductSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsStaffOrAdmin()]
        
    def get_queryset(self):
        if self.request.user.is_authenticated and (self.request.user.role in ['staff', 'admin'] or self.request.user.is_staff):
            return Product.objects.all().select_related('category').prefetch_related('images')
        return get_active_products()
        
    lookup_field = 'slug'
