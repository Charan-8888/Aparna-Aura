from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from rest_framework.exceptions import ValidationError as DRFValidationError
import logging
import secrets
from datetime import timedelta

from .models import PasswordResetOTP

User = get_user_model()
logger = logging.getLogger('api.errors')

def create_user(email, password, first_name, last_name, role='customer'):
    try:
        validate_password(password)
    except ValidationError as e:
        raise ValueError(e.messages)

    if User.objects.filter(email=email).exists():
        raise ValueError(["User with this email already exists."])
        
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role=role
    )
    return user


def authenticate_google_user(credential):
    """Verify a Google ID token and return the matching local user."""
    client_id = settings.GOOGLE_OAUTH_CLIENT_ID
    if not client_id:
        raise DRFValidationError({"google": "Google sign-in is not configured on this server."})

    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token

        identity = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            client_id,
        )
    except ImportError:
        raise DRFValidationError({"google": "Google sign-in dependency is not installed."})
    except ValueError:
        raise DRFValidationError({"google": "Google sign-in token is invalid or expired."})

    email = identity.get('email')
    subject = identity.get('sub')
    if not email or not subject or not identity.get('email_verified'):
        raise DRFValidationError({"google": "Google did not provide a verified email address."})

    user = User.objects.filter(google_subject=subject).first()
    if user:
        return user

    user = User.objects.filter(email__iexact=email).first()
    if user:
        user.google_subject = subject
        user.save(update_fields=['google_subject'])
        return user

    full_name = identity.get('name', '').strip().split(maxsplit=1)
    first_name = identity.get('given_name') or (full_name[0] if full_name else email.split('@')[0])
    last_name = identity.get('family_name') or (full_name[1] if len(full_name) > 1 else '')
    user = User.objects.create_user(
        email=email,
        password=None,
        first_name=first_name[:50],
        last_name=last_name[:50],
        google_subject=subject,
    )
    return user

def change_user_password(user, old_password, new_password):
    if not user.check_password(old_password):
        raise ValueError(["Incorrect old password."])
        
    try:
        validate_password(new_password, user=user)
    except ValidationError as e:
        raise ValueError(e.messages)
        
    user.set_password(new_password)
    user.save()
    revoke_user_refresh_tokens(user)
    return user


def revoke_user_refresh_tokens(user):
    """Invalidate every active refresh session for a user."""
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)

def request_password_reset(email):
    """Email a six-digit OTP without disclosing whether an account exists."""
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if user:
        otp = f"{secrets.randbelow(1_000_000):06d}"
        PasswordResetOTP.objects.update_or_create(
            user=user,
            defaults={
                'code_hash': make_password(otp),
                'expires_at': timezone.now() + timedelta(minutes=10),
                'failed_attempts': 0,
            },
        )
        try:
            send_mail(
                subject='Your Aparna Aura password reset code',
                message=(
                    'We received a request to reset your password.\n\n'
                    f'Your one-time verification code is: {otp}\n\n'
                    'This code expires in 10 minutes and can be used only once.\n\n'
                    'If you did not request this, you can safely ignore this email.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            # Preserve account privacy: callers always receive the same response.
            logger.exception('Password-reset email delivery failed.')
    return True

def reset_password(email, otp, new_password):
    """Verify the OTP, set a new password, and revoke every existing session."""
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if not user:
        raise ValueError(["Invalid or expired verification code."])

    try:
        validate_password(new_password, user=user)
    except ValidationError as e:
        raise ValueError(e.messages)

    try:
        reset_otp = user.password_reset_otp
    except PasswordResetOTP.DoesNotExist:
        raise ValueError(["Invalid or expired reset token."])

    if reset_otp.expires_at <= timezone.now() or reset_otp.failed_attempts >= 5:
        reset_otp.delete()
        raise ValueError(["Invalid or expired verification code."])

    if not check_password(otp, reset_otp.code_hash):
        reset_otp.failed_attempts += 1
        reset_otp.save(update_fields=['failed_attempts', 'created_at'])
        raise ValueError(["Invalid or expired verification code."])

    user.set_password(new_password)
    user.save(update_fields=['password'])
    reset_otp.delete()
    revoke_user_refresh_tokens(user)
    return user
