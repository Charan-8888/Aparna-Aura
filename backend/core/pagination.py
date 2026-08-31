"""
core.pagination
~~~~~~~~~~~~~~~
Custom paginator that wraps paginated results inside the project
success envelope:

    {
        "success": true,
        "count": ...,
        "next": ...,
        "previous": ...,
        "results": [ ... ]
    }

Register in settings.py → REST_FRAMEWORK["DEFAULT_PAGINATION_CLASS"].
"""

from collections import OrderedDict
from django.core.paginator import InvalidPage, EmptyPage
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    """
    Page-number pagination with a standardised response envelope.

    Defaults:
        page_size      = 12   (project standard)
        max_page_size  = 100
        page_size_query_param = 'page_size'  (client can request fewer/more)
    """
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = self.get_page_number(request, paginator)

        try:
            self.page = paginator.page(page_number)
        except InvalidPage:
            # Gracefully handle out-of-range page numbers (e.g. category switch or filter narrowing)
            fallback_page = max(1, paginator.num_pages)
            try:
                self.page = paginator.page(fallback_page)
            except InvalidPage:
                self.page = paginator.page(1)

        if paginator.num_pages > 1 and self.template is not None:
            self.display_page_controls = True

        self.request = request
        return list(self.page)

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('success', True),
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data),
        ]))

    def get_paginated_response_schema(self, schema):
        """Schema override for drf-spectacular compatibility."""
        return {
            'type': 'object',
            'required': ['success', 'count', 'results'],
            'properties': {
                'success': {'type': 'boolean', 'example': True},
                'count': {'type': 'integer', 'example': 123},
                'next': {'type': 'string', 'nullable': True, 'format': 'uri'},
                'previous': {'type': 'string', 'nullable': True, 'format': 'uri'},
                'results': schema,
            },
        }

