"""
core.utils
~~~~~~~~~~
Shared utility functions used across the project.
"""


def get_client_ip(request):
    """
    Extract the client's real IP address from the request,
    respecting X-Forwarded-For when behind a reverse proxy.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
