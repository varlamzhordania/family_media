from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from main.v1.serializers import FamilySerializer
from accounts.v1.serializers import PublicUserSerializer

from chat.models import Room, Message, MessageMedia, VideoCall


class MessageMediaSerializer(serializers.ModelSerializer):
    ext = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MessageMedia
        fields = ['file', 'size', 'ext']

    def get_ext(self, obj):
        return obj.get_extension()


class VideoCallSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = VideoCall
        fields = [
            'creator',
            'participants',
            'status',
            'started_at',
            'ended_at',
        ]


class RoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    family = FamilySerializer(read_only=True)
    participants = PublicUserSerializer(many=True, read_only=True)
    video_call = VideoCallSerializer(read_only=True)

    class Meta:
        model = Room
        fields = [
            'id',
            'type',
            'title',
            'description',
            'family',
            'participants',
            'avatar',
            'created_by',
            'is_archived',
            'is_active',
            'created_at',
            'updated_at',
            'last_message',
            'video_call',
        ]

    def get_last_message(self, obj: Room):
        return MessageSerializer(
            obj.latest_message(),
            many=False,
            context=self.context
        ).data

    # def get_participants(self, obj):
    #     participants = obj.participants.all()
    #     return.data


class MessageReplySerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'content', 'user', 'room', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField(read_only=True)
    medias = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Message
        fields = '__all__'

    @extend_schema_field(
        serializers.ListSerializer(child=MessageMediaSerializer())
    )
    def get_medias(self, obj):
        queryset = obj.medias.filter(is_active=True)
        serializer = MessageMediaSerializer(
            queryset,
            many=True,
            context=self.context
        )
        return serializer.data

    @extend_schema_field(MessageReplySerializer())
    def get_reply_to(self, obj):
        if obj.reply_to:
            # Prevent full recursive nesting by using a smaller serializer or limiting depth
            return MessageSerializer(
                obj.reply_to,
                context=self.context
            ).data
        return None


class MessageCreateSerializer(serializers.ModelSerializer):
    media = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        read_only=True,
    )

    class Meta:
        model = Message
        fields = '__all__'


class MessageMediaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageMedia
        fields = "__all__"


class LiveKitTokenRequestSerializer(serializers.Serializer):
    room_id = serializers.IntegerField()


class LiveKitTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    livekit_url = serializers.CharField()
    room_id = serializers.IntegerField()
