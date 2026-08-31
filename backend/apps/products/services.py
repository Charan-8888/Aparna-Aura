from .models import Product, Category

def get_active_categories():
    """Returns active categories ordered by display_order."""
    return Category.objects.filter(is_active=True).order_by('display_order')

def get_active_products():
    """Returns active products with optimized related queries."""
    return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
