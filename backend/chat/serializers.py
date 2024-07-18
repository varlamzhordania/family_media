from rest_framework import serializers

from main.serializers import FamilySerializer
from accounts.serializers import PublicUserSerializer

from .models import Room, Message


class RoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    family = FamilySerializer(read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_last_message(self, obj: Room):
        return MessageSerializer(obj.latest_message(), many=False, context=self.context).data

    def get_participants(self, obj):
        participants = obj.participants.all()
        return PublicUserSerializer(participants, many=True, context=self.context).data


class MessageSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'

    def get_reply_to(self, obj):
        if obj.reply_to:
            return MessageSerializer(obj.reply_to).data
        return None
