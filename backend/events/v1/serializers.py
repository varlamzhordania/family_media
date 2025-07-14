from rest_framework import serializers

from events.models import Event, Invitation


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class InvitationCreateInputSerializer(serializers.Serializer):
    family = serializers.IntegerField(required=True)
    target = serializers.CharField(required=True)
    service = serializers.ChoiceField(choices=[s for s, _ in Invitation.ServicesChoices.choices])
    expire = serializers.IntegerField(required=False)
