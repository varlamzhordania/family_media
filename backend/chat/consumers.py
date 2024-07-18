from typing import List, Dict, Type, Optional, Any
import json

from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async, SyncToAsync
from rest_framework.renderers import JSONRenderer
from asgiref.sync import sync_to_async

from .models import Message, Room
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'private_chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send_history()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        if action == "new_message":
            serializer = await self.save_message(text_data_json)
            await self.broadcast_message(action, serializer)
            await self.send_notification(action, serializer)
        elif action == "delete_message":
            result = await self.delete_message(text_data_json)
            if result:
                await self.broadcast_message(action, text_data_json)
        elif action == "read_messages":
            serializer = await self.set_read(text_data_json)
            await self.broadcast_message(action, serializer)
        elif action == "typing" or action == "stop_typing":
            await self.broadcast_message(action, text_data_json)

    async def send_history(self):
        queryset = await self.pull_history(self.room_id)
        message = {
            "action": "pull_history",
            "results": queryset,
        }
        await self.send(text_data=json.dumps(message))

    async def broadcast_message(self, action, data):
        if action == "new_message":
            message = {
                "action": action,
                "results": data
            }
        elif action == "delete_message":
            message = {
                "action": action,
                "results": data['message']
            }
        elif action == "read_messages":
            message = {
                "action": action,
                "results": data
            }
        elif action == "typing" or action == "stop_typing":
            message = {
                "action": action,
                "results": data
            }
        else:
            message = {
                "action": "ping",
                "results": None
            }

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    async def send_notification(self, action, data):
        participants = await self.get_participants()
        messages = await self.ready_message(action, participants, data)
        for message in messages:
            await self.channel_layer.group_send(
                f"user_{message['target']}",
                {
                    'type': 'send_notification',
                    'message': message
                }
            )

    @sync_to_async
    def ready_message(self, action, participants, data):
        messages = []
        for participant in participants:
            if participant.id != self.user.id:
                messages.append(
                    {
                        "action": action,
                        "target": participant.id,
                        "results": data
                    }
                )
        return messages

    @database_sync_to_async
    def get_participants(self):
        room = Room.objects.get(id=self.room_id)
        return list(room.participants.all())

    @database_sync_to_async
    def pull_history(self, room_id):
        queryset = Message.objects.filter(room_id=room_id)[:25]
        return self.get_serializer_data_to_dict(MessageSerializer(queryset, many=True))

    @database_sync_to_async
    def set_read(self, data):
        dict_data = data['messages']
        queryset = []
        for data in dict_data:
            message = Message.objects.get(id=data['id'])
            message.have_read.add(self.user)
            queryset.append(message)
        return self.get_serializer_data_to_dict(MessageSerializer(queryset, many=True))

    @database_sync_to_async
    def save_message(self, data):
        message = data['message']
        reply_to = data.get('reply_to', None)
        if reply_to:
            reply_to_message = Message.objects.get(id=reply_to)
            obj = Message.objects.create(
                user=self.user,
                room_id=self.room_id,
                content=message,
                reply_to=reply_to_message
            )
            return self.get_serializer_data_to_dict(MessageSerializer(obj, many=False))
        obj = Message.objects.create(user=self.user, room_id=self.room_id, content=message)
        return self.get_serializer_data_to_dict(MessageSerializer(obj, many=False))

    @database_sync_to_async
    def delete_message(self, data):
        message_id = data['message']
        try:
            obj = Message.objects.get(id=message_id)
            if self.have_delete_permission(obj):
                obj.delete()
                return True
        except Message.DoesNotExist:
            return False

    def get_serializer_data_to_dict(self, serializer):
        serialized_data = JSONRenderer().render(serializer.data)
        return json.loads(serialized_data.decode())

    def have_delete_permission(self, message: Message) -> bool:
        """
        Check if the user has permission to perform delete on the message.

        Permissions:
        1. User is the sender of the message.
        2. User is the creator of the room.
        3. User is the creator of the family (if family exists).
        4. User is an admin and a member of the family associated with the room (if family exists).
        """

        user = self.user

        # User is the sender of the message
        if message.user.pk == user.pk:
            return True

        # User is the creator of the room
        if message.room.created_by == user:
            return True

        # Check if the room is associated with a family
        if message.room.family:
            # User is the creator of the family
            if message.room.family.creator == user:
                return True

            # User is an admin and a member of the family
            if (
                    message.room.family.admins.filter(pk=user.pk).exists() and
                    message.room.family.members.filter(pk=user.pk).exists()
            ):
                return True

        return False
