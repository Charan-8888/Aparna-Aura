from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Address

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'date_joined')
        read_only_fields = ('id', 'role', 'date_joined')

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True)


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(required=True, write_only=True, trim_whitespace=False)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.RegexField(r'^\d{6}$', required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, trim_whitespace=False)

class AddressSerializer(serializers.ModelSerializer):
    phone = serializers.RegexField(
        r'^\+?[0-9][0-9\s-]{7,18}$',
        error_messages={'invalid': 'Enter a valid recipient phone number.'},
    )

    class Meta:
        model = Address
        fields = (
            'id', 'full_name', 'phone', 'house_no', 'street', 
            'landmark', 'city', 'state', 'pincode', 'country', 'latitude', 'longitude',
            'is_default', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
