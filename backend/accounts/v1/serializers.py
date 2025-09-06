from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from accounts.models import User, Friendship, Relation


class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError(
                {'password2': 'Passwords do not match.'}
            )
        try:
            validate_password(data['password1'])
        except ValidationError as e:
            raise serializers.ValidationError({'password1': e.messages})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password1']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    initial_name = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        exclude = ['password', 'last_ip']
        read_only_fields = ['last_ip', 'email_verified', 'date_joined',
                            'last_login', 'last_ip',
                            'id', 'is_superuser', 'is_staff', 'is_online',
                            'groups',
                            'user_permissions', 'username', 'email',
                            'is_active']

    def get_initial_name(self, obj):
        return obj.get_initials_name

    def get_full_name(self, obj):
        return obj.get_full_name


class PublicUserSerializer(serializers.ModelSerializer):
    initial_name = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'avatar', 'initial_name', 'full_name', 'is_online']

    def get_initial_name(self, obj):
        return obj.get_initials_name

    def get_full_name(self, obj):
        return obj.get_full_name


class UserDetailResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    memberships = serializers.SerializerMethodField()
    friends = PublicUserSerializer(many=True)

    def get_memberships(self, obj):
        from main.v1.serializers import FamilyMembersSerializer

        return FamilyMembersSerializer(
            obj['memberships'],
            many=True,
            context=self.context
        ).data


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = PublicUserSerializer(read_only=True)
    to_user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = "__all__"


class RelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relation
        fields = ['pk', 'user', 'related', 'relation', 'is_active']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                _("User with this email does not exist.")
            )
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

        if not PasswordResetTokenGenerator().check_token(
                user,
                attrs['token']
        ):
            raise serializers.ValidationError(
                _('Invalid token or expired token.')
            )
        new_password = attrs['new_password']
        if self.check_password(new_password):
            user.set_password(new_password)
            user.save()
            return user


class FriendActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=['request', 'accept', 'decline', 'remove'],
        help_text="Action to perform on friend request"
    )

    class Meta:
        ref_name = "FriendRequestAction"  # unique name for OpenAPI docs
