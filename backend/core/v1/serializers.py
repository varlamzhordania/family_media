from rest_framework import serializers


class ConfigSerializer(serializers.Serializer):
    google_public_key = serializers.CharField(read_only=True,required=False)
    android_google_public_key = serializers.CharField(read_only=True,required=False)
    ios_google_public_key = serializers.CharField(read_only=True,required=False)
    facebook_public_key = serializers.CharField(read_only=True,required=False)
