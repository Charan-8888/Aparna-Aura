from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class GracefulJWTAuthentication(JWTAuthentication):
    """
    Subclass of SimpleJWT's JWTAuthentication that gracefully handles invalid
    or expired tokens by treating the request as unauthenticated (returning None)
    rather than raising an AuthenticationFailed / InvalidToken exception.

    This ensures that public endpoints (such as GET /api/v1/products/) do not fail
    with a 401 error when a client sends an expired or invalid token in local storage.
    Protected endpoints still enforce authentication via permission classes (e.g., IsAuthenticated).
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            return None
