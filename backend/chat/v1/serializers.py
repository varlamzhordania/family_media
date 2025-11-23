from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from django.contrib.auth import get_user_model

from main.v1.serializers import FamilySerializer
from accounts.v1.serializers import PublicUserSerializer

from chat.models import Room, Message, MessageMedia, VideoCall

User = get_user_model()


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


class IceServerResponseSerializer(serializers.Serializer):
    urls = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of STUN/TURN URLs (e.g. ['stun:stun.l.google.com:19302'])"
    )
    username = serializers.CharField(
        allow_null=True,
        required=False,
        help_text="Only required for TURN servers"
    )
    credential = serializers.CharField(
        allow_null=True,
        required=False,
        help_text="Only required for TURN servers"
    )


class LiveKitTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    livekit_url = serializers.CharField()
    room_id = serializers.IntegerField()
    room_name = serializers.CharField()
    room_type = serializers.CharField()
    ice_servers = IceServerResponseSerializer(many=True)


class GroupCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False)
    participants = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_participants(self, users):
        users = list(set(users))  # remove duplicates

        # if len(users) < 2:
        #     raise serializers.ValidationError(
        #         "A group must have at least 3 total participants (including you)."
        #     )

        qs = User.objects.filter(id__in=users)
        if qs.count() != len(users):
            raise serializers.ValidationError(
                "Some participants do not exist."
            )

        return users


class GroupUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["title", "description", "avatar"]
        extra_kwargs = {
            "title": {"required": False},
            "description": {"required": False},
            "avatar": {"required": False},
        }

    def validate(self, attrs):
        room = self.instance
        user = self.context["request"].user

        # Make sure user is participant
        if user not in room.participants.all():
            raise serializers.ValidationError(
                "You are not a member of this group."
                )
        return attrs

class AddParticipantsSerializer(serializers.Serializer):
    participants = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate_participants(self, users):
        users = list(set(users))
        qs = User.objects.filter(id__in=users)
        if qs.count() != len(users):
            raise serializers.ValidationError("Some users do not exist.")
        return users

class RemoveParticipantsSerializer(serializers.Serializer):
    participants = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )

    def validate(self, attrs):
        users = attrs["participants"]

        # Cannot remove creator
        room = self.context["room"]
        creator_id = room.created_by.id if room.created_by else None

        if creator_id in users:
            raise serializers.ValidationError(
                "You cannot remove the group creator."
            )

        return attrs
