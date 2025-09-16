from rest_framework import serializers


class ConfigSerializer(serializers.Serializer):
    google_public_key = serializers.CharField(read_only=True)
    facebook_public_key = serializers.CharField(read_only=True)
