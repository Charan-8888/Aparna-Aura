from rest_framework import generics, status, views, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    AddressSerializer, GoogleLoginSerializer
)
from .models import Address
from .services import (
    create_user, change_user_password, request_password_reset, reset_password,
    authenticate_google_user
)

class RegisterView(views.APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'register'
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = create_user(**serializer.validated_data)
                # Issue JWT tokens so the frontend can auto-login immediately
                refresh = RefreshToken.for_user(user)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({
                    "success": False,
                    "data": None,
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": False, "data": None, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'login'


class GoogleLoginView(views.APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'google_login'

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate_google_user(serializer.validated_data['credential'])
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })

class LogoutView(views.APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            # Frontend sends the key as 'refresh' (simplejwt convention)
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                if str(token.get('user_id')) != str(request.user.id):
                    return Response({"success": False, "error": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)
                token.blacklist()
            return Response({"success": True, "message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                change_user_password(
                    request.user, 
                    serializer.validated_data['old_password'], 
                    serializer.validated_data['new_password']
                )
                return Response({"success": True, "message": "Password changed successfully."})
            except ValueError as e:
                return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(views.APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'password_reset'
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            request_password_reset(serializer.validated_data['email'])
            return Response({"success": True, "message": "If an account exists, a verification code was sent."})
        return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(views.APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'password_reset_confirm'
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                reset_password(
                    serializer.validated_data['email'],
                    serializer.validated_data['otp'],
                    serializer.validated_data['new_password'],
                )
                return Response({"success": True, "message": "Password has been reset."})
            except ValueError as e:
                return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ContactInquiryView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()
        subject = request.data.get('subject', 'General Inquiry').strip()
        message = request.data.get('message', '').strip()

        if not name or not email or not message:
            return Response(
                {"success": False, "error": "Name, email, and message are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        full_message = f"Contact Inquiry from Aparna Aura Store:\n\nName: {name}\nEmail: {email}\nPhone: {phone}\nSubject: {subject}\n\nMessage:\n{message}"
        try:
            send_mail(
                subject=f"[Aparna Aura Inquiry] {subject}",
                message=full_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            "success": True,
            "message": "Thank you for reaching out to Aparna Aura. Our concierge will respond to your inquiry shortly."
        }, status=status.HTTP_200_OK)

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save()
