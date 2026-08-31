"""
core.responses
~~~~~~~~~~~~~~
Standardized success response helpers.

Every success response follows the envelope:

    {
        "success": true,
        "message": "...",
        "data": { ... }
    }
"""

from rest_framework import status
from rest_framework.response import Response


def success_response(data=None, message="Request successful.", status_code=status.HTTP_200_OK):
    """
    Generic success response.

    Usage::

        return success_response(
            data=serializer.data,
            message="Products retrieved.",
        )
    """
    return Response(
        {
            "success": True,
            "message": message,
            "data": data if data is not None else {},
        },
        status=status_code,
    )


def created_response(data=None, message="Resource created successfully."):
    """
    201 Created response.

    Usage::

        return created_response(
            data=serializer.data,
            message="Cart item added.",
        )
    """
    return success_response(
        data=data,
        message=message,
        status_code=status.HTTP_201_CREATED,
    )


def deleted_response(message="Resource deleted successfully."):
    """
    204-style response (but returns 200 with envelope so the
    client always gets a parsable JSON body).

    Usage::

        return deleted_response(message="Cart item removed.")
    """
    return success_response(
        data=None,
        message=message,
        status_code=status.HTTP_200_OK,
    )
