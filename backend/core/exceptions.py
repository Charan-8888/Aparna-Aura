"""
core.exceptions
~~~~~~~~~~~~~~~
Global DRF exception handler that returns a standardized JSON envelope:

    {
        "success": false,
        "message": "...",
        "errors": { ... }
    }

Register in settings.py → REST_FRAMEWORK["EXCEPTION_HANDLER"].
"""

import logging

from django.db import IntegrityError
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    MethodNotAllowed,
    NotAuthenticated,
    NotFound,
    ParseError,
    PermissionDenied,
    Throttled,
    ValidationError,
)
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger('api.errors')


def _error_envelope(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Build the standardized error response dict."""
    return (
        {
            "success": False,
            "message": message,
            "errors": errors or {},
        },
        status_code,
    )


def custom_exception_handler(exc, context):
    """
    Centralised exception handler for every DRF view.

    • Delegates to DRF's built-in handler first so that standard
      negotiation / renderer logic is preserved.
    • Then normalises the response body into the project envelope.
    • Catches ``IntegrityError`` that DRF doesn't handle natively.
    • Catches any remaining unhandled exceptions as 500s.
    """

    # Let DRF handle it first (sets correct headers, status, etc.)
    response = drf_exception_handler(exc, context)

    # ── DRF-handled exceptions ────────────────────────────────────
    if response is not None:
        body, status_code = _handle_drf_exception(exc, response)
        response.data = body
        response.status_code = status_code
        _log_exception(exc, context, status_code)
        return response

    # ── IntegrityError (DB-level constraint violation) ────────────
    if isinstance(exc, IntegrityError):
        from rest_framework.response import Response

        body, status_code = _error_envelope(
            message="A database integrity constraint was violated.",
            errors={"detail": str(exc)},
            status_code=status.HTTP_409_CONFLICT,
        )
        _log_exception(exc, context, status_code)
        return Response(body, status=status_code)

    # ── Unhandled / unexpected exceptions ─────────────────────────
    from rest_framework.response import Response

    logger.exception(
        "Unhandled exception in %s %s",
        context.get('request', {}).method if hasattr(context.get('request', {}), 'method') else 'UNKNOWN',
        context.get('request', {}).path if hasattr(context.get('request', {}), 'path') else 'UNKNOWN',
    )
    body, status_code = _error_envelope(
        message="An unexpected error occurred. Please try again later.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
    return Response(body, status=status_code)


# ── Private helpers ───────────────────────────────────────────────────────────

def _handle_drf_exception(exc, response):
    """Map each DRF exception type to a user-friendly envelope."""

    if isinstance(exc, ValidationError):
        return _error_envelope(
            message="Validation failed.",
            errors=exc.detail,
            status_code=response.status_code,
        )

    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        return _error_envelope(
            message="Authentication credentials were not provided or are invalid.",
            status_code=response.status_code,
        )

    if isinstance(exc, PermissionDenied):
        return _error_envelope(
            message="You do not have permission to perform this action.",
            status_code=response.status_code,
        )

    if isinstance(exc, NotFound):
        return _error_envelope(
            message="The requested resource was not found.",
            status_code=response.status_code,
        )

    if isinstance(exc, MethodNotAllowed):
        return _error_envelope(
            message=f"HTTP method '{exc.detail}' is not allowed on this endpoint.",
            status_code=response.status_code,
        )

    if isinstance(exc, ParseError):
        return _error_envelope(
            message="Malformed request body.",
            errors={"detail": str(exc.detail)},
            status_code=response.status_code,
        )

    if isinstance(exc, Throttled):
        return _error_envelope(
            message=f"Request was throttled. Try again in {exc.wait} seconds.",
            status_code=response.status_code,
        )

    # Fallback for any other APIException subclass.
    if isinstance(exc, APIException):
        return _error_envelope(
            message=str(exc.detail),
            status_code=response.status_code,
        )

    return _error_envelope(
        message="An error occurred.",
        status_code=response.status_code,
    )


def _log_exception(exc, context, status_code):
    """Log API errors at the appropriate level."""
    request = context.get('request')
    view = context.get('view')
    view_name = view.__class__.__name__ if view else 'UnknownView'

    log_data = {
        'view': view_name,
        'method': getattr(request, 'method', 'UNKNOWN'),
        'path': getattr(request, 'path', 'UNKNOWN'),
        'status': status_code,
        'exception': type(exc).__name__,
    }

    if status_code >= 500:
        logger.error("Server error: %s", log_data, exc_info=True)
    elif status_code >= 400:
        logger.warning("Client error: %s", log_data)
