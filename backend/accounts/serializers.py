from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .models import User


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['email_verified', 'date_joined', 'last_login', 'last_ip', 'is_staff', 'is_superuser', 'is_active',
                   'groups', 'user_permissions', 'username']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    initial_name = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        exclude = ['password', 'last_ip']
        read_only_fields = ['last_ip', 'email_verified', 'date_joined', 'last_login', 'last_ip', 'id', '']

    def get_initial_name(self, obj):
        return obj.get_initials_name

    def get_full_name(self, obj):
        return obj.get_full_name


class PublicUserSerializer(serializers.ModelSerializer):
    initial_name = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'avatar', 'initial_name', 'full_name']

    def get_initial_name(self, obj):
        return obj.get_initials_name

    def get_full_name(self, obj):
        return obj.get_full_name


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("User with this email does not exist."))
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    def check_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(_('Invalid token.'))

        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            raise serializers.ValidationError(_('Invalid token or expired token.'))
        new_password = attrs['new_password']
        if self.check_password(new_password):
            user.set_password(new_password)
            user.save()
            return user
