import django_filters
from django.db.models import Q
from .models import Product

# Smart alias mapping for category queries
CATEGORY_ALIASES = {
    'necklaces': ['necklaces', 'necklace-sets', 'mangalsutra', 'pendants'],
    'necklace-sets': ['necklace-sets', 'necklaces', 'jewellery-sets'],
    'pendants': ['pendants', 'necklace-sets', 'mangalsutra'],
    'bracelets': ['bracelets', 'watches', 'bangles'],
    'bangles': ['bangles', 'watches', 'bracelets'],
    'watches': ['watches', 'bracelets'],
    'mangalsutra': ['mangalsutra', 'necklaces'],
    'jewellery-sets': ['jewellery-sets', 'necklace-sets', 'watches', 'bridal-jewellery'],
    'bridal-jewellery': ['bridal-jewellery', 'necklace-sets', 'traditional-jewellery'],
    'traditional-jewellery': ['traditional-jewellery', 'necklace-sets', 'earrings'],
    'everyday-jewellery': ['everyday-jewellery', 'earrings', 'mangalsutra'],
    'rings': ['rings', 'earrings'],
    'anklets': ['anklets', 'earrings', 'bracelets'],
    'maang-tikka': ['maang-tikka', 'necklace-sets', 'earrings'],
    'nose-rings': ['nose-rings', 'earrings'],
    'hair-accessories': ['hair-accessories', 'earrings'],
    'waist-jewellery': ['waist-jewellery', 'necklace-sets'],
}

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = django_filters.CharFilter(method='filter_category')

    class Meta:
        model = Product
        fields = ['category', 'is_featured', 'is_trending', 'is_new_arrival', 'is_active']

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        val = value.lower().strip()
        slugs = CATEGORY_ALIASES.get(val, [val])
        return queryset.filter(category__slug__in=slugs)
