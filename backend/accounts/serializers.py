from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password', 'last_ip']


class PublicUserSerializer(serializers.ModelSerializer):
    initial_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'avatar', 'initial_name', 'full_name']

    def get_initial_name(self, obj):
        return obj.get_initials_name

    def get_full_name(self, obj):
        return obj.get_full_name
