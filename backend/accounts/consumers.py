import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.renderers import JSONRenderer

from chat.models import Room
from chat.v1.serializers import RoomSerializer

User = get_user_model()


class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user: User = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()
            await self.update_user_status(online=True)
            await self.send_room_list()
            await self.channel_layer.group_add(f'user_{self.user.id}', self.channel_name)
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.update_user_status(online=False)
            await self.channel_layer.group_discard(f'user_{self.user.id}', self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        json_text_data = json.loads(text_data)
        action = json_text_data["action"]

        if action == "get_or_create_room":
            serializer = await self.get_or_create_room(json_text_data)
            if serializer is not None:
                await self.send_room(serializer)
        elif action == "pull_rooms":
            await self.send_room_list()
        elif action == "new_message_notification":
            # await self.send_notification(action, json_text_data)
            print("got new_message_notification")
        else:
            print("Unknown action", action)

    async def send_room(self, serializer):
        message = {
            "action": "single_room",
            "results": serializer,
        }
        await self.send(text_data=json.dumps(message))

    async def send_room_list(self):
        rooms = await self.get_room_list()
        message = {
            "action": "pull_rooms",
            "results": rooms,
        }
        await self.send(text_data=json.dumps(message))

    async def send_notification(self, event):
        message = {
            "action": event['message']['action'],
            "results": event['message']['results'],
        }
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_or_create_room(self, data):
        dm = data.get("dm", None)
        if dm is not None:
            dm = int(dm)
            if dm == self.user.id:
                return None
            try:
                dm_target = User.objects.get(pk=dm)
                room = Room.objects.filter(type=Room.TypeChoices.PRIVATE, participants=self.user.id).filter(
                    participants=dm_target
                )
                if room.exists():
                    return self.get_serializer_data_to_dict(RoomSerializer(room.first(), many=False))
                else:
                    room = Room.objects.create(
                        type=Room.TypeChoices.PRIVATE,
                        title=f"Private Room between {dm_target.get_fulll_name}-{self.user.get_full_name}",
                        created_by=self.user
                    )
                    room.participants.set([self.user.id, dm])
                    return self.get_serializer_data_to_dict(RoomSerializer(room, many=False))

            except User.DoesNotExist:
                return None
            except Exception as e:
                print("An error occurred while trying to create room: ", str(e))
                return None

    @database_sync_to_async
    def update_user_status(self, online):
        self.user.is_online = online
        self.user.save(update_fields=["is_online"])

    @database_sync_to_async
    def get_room_list(self):
        queryset = self.user.participants.filter(is_active=True)
        return self.get_serializer_data_to_dict(RoomSerializer(queryset, many=True))

    def get_serializer_data_to_dict(self, serializer):
        serialized_data = JSONRenderer().render(serializer.data)
        return json.loads(serialized_data.decode())
