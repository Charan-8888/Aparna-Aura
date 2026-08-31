from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    """Allows access only to authenticated users with the 'customer' role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'customer')

class IsStaffOrAdmin(permissions.BasePermission):
    """Allows access to users with 'staff' or 'admin' roles, or superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.role in ['staff', 'admin'] or request.user.is_staff
        ))

class IsAdminUser(permissions.BasePermission):
    """Allows access strictly to users with the 'admin' role or superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_superuser
        ))
