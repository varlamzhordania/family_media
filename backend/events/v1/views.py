from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.utils.translation import gettext as _
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiTypes,
    OpenApiResponse,
)

from main.models import Family, FamilyMembers

from events.models import Event, Invitation
from .serializers import EventSerializer, InvitationCreateInputSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Events"],
        description="List all active events in families the user belongs to. Optionally filter by family ID.",
        parameters=[
            {
                "name": "family",
                "description": "Filter events by family ID",
                "required": False,
                "in": "query",
                "schema": {"type": "integer"},
            }
        ],
        responses=EventSerializer(many=True),
    ),
    retrieve=extend_schema(
        tags=["Events"],
        description="Retrieve a specific event by its ID",
        responses=EventSerializer,
    ),
    create=extend_schema(
        tags=["Events"],
        description="Create a new event",
        request=EventSerializer,
        responses=EventSerializer,
    ),
    update=extend_schema(
        tags=["Events"],
        description="Update an event entirely",
        request=EventSerializer,
        responses=EventSerializer,
    ),
    partial_update=extend_schema(
        tags=["Events"],
        description="Partially update an event",
        request=EventSerializer,
        responses=EventSerializer,
    ),
    destroy=extend_schema(
        tags=["Events"],
        description="Delete an event",
        responses={204: None},
    ),
)
class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        families = Family.objects.filter(members=user)

        family_param = self.request.query_params.get('family', None)

        if family_param:
            family = get_object_or_404(families, id=family_param)
            return Event.objects.filter(is_active=True, family=family)
        else:
            return Event.objects.filter(is_active=True, family__in=families)

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))
        self.check_object_permissions(self.request, obj)
        return obj


@extend_schema(tags=["Events"])
class InvitationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Accept an invitation",
        description="Accepts an invitation by invitation code. Adds the current user to the family.",
        parameters=[
            OpenApiParameter(
                name="code",
                required=True,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Invitation code to accept"
            ),
        ],
        responses={
            200: OpenApiResponse(description="Invitation accepted or already a member."),
            400: OpenApiResponse(description="Missing or invalid invitation code."),
        }
    )
    @transaction.atomic
    def get(self, request: Request, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            code = request.query_params.get('code', None)

            if code is None:
                return Response(
                    {"detail": "Invitation Code is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            invitation = Invitation.objects.get(invitation_code=code)

            if invitation.expires_at < timezone.now():
                return Response(
                    {"detail": "Invitation expired."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            family = invitation.family
            if family.members.filter(pk=user.pk).exists():
                return Response(
                    {"message": f"You already a member of {family.name} family.",
                     "family_id": family.pk},
                    status=status.HTTP_200_OK
                )
            family.members.add(user)
            return Response(
                {"message": f"Welcome to {family.name} family.", "family_id": family.pk},
                status=status.HTTP_200_OK
            )

        except Invitation.DoesNotExist:
            return Response(
                {"detail": "Invitation is invalid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            print(str(e))
            return Response(
                {"detail": f"An unexpected error occurred"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Send an invitation",
        description="Sends a family invitation using the selected service (e.g. email, sms).",
        request=InvitationCreateInputSerializer,
        responses={
            200: OpenApiResponse(description="Invitation sent successfully."),
            400: OpenApiResponse(description="Missing or invalid input."),
            403: OpenApiResponse(description="Not authorized to invite to this family."),
            404: OpenApiResponse(description="Family not found."),
        }
    )
    @transaction.atomic
    def post(self, request: Request, format=None, *args, **kwargs) -> Response:
        serializer = InvitationCreateInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        validated = serializer.validated_data
        family_id = validated['family']
        target = validated['target']
        service = validated.get('service', Invitation.ServicesChoices.EMAIL)
        expire = validated.get('expire', None)

        try:
            family = Family.objects.get(pk=family_id, is_active=True, members__in=[user])
            family_member = FamilyMembers.objects.get(family=family, member=user, is_active=True)

            invitation = Invitation.objects.create(
                family_id=family.id,
                invited_by=family_member,
                service=service,
                target=target
            )
            if expire is not None:
                invitation.set_expire_date(int(expire))
            invitation.set_invitation_code()

            if service == Invitation.ServicesChoices.EMAIL:
                return self.send_email(invitation)
            elif service == Invitation.ServicesChoices.SMS:
                return self.send_sms(invitation)
            elif service == Invitation.ServicesChoices.TELEGRAM:
                return self.send_telegram(invitation)
            elif service == Invitation.ServicesChoices.WHATSAPP:
                return self.send_whatsapp(invitation)
            elif service == Invitation.ServicesChoices.TWITTER:
                return self.send_twitter(invitation)
            else:
                return self.service_not_available(invitation)

        except FamilyMembers.DoesNotExist:
            return Response(
                {'detail': 'You are not a member of this family.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with the given ID not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": f"An unexpected error occurred"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def service_not_available(self, invitation: Invitation):
        return Response(
            {"detail": f"Service {invitation.service} not available. Please try another service."},
            status=status.HTTP_400_BAD_REQUEST
        )

    def send_email(self, invitation: Invitation):
        family = invitation.family
        expire_text = f"This invitation link will expire after {invitation.expire_hour} hour. \n" if invitation.expires_at else ""
        email_subject = _(f"Invitation to Join the {family.name} Family")
        email_body = f"""
            Dear {invitation.target},

            You have been cordially invited to join the {family.name} family.

            Please click on the link below to accept the invitation and join our family:
            {settings.FRONTEND_URL}/invitations/{invitation.invitation_code}/

            {expire_text}
            Best regards,
            The {family.name} Family
        """

        send_mail(
            subject=email_subject,
            message=email_body,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[invitation.target],
            fail_silently=False,
        )
        return Response(
            {"message": f"Invitation sent successfully via {invitation.service}."},
            status=status.HTTP_200_OK
        )

    def send_sms(self, invitation: Invitation):
        return self.service_not_available(invitation)

    def send_telegram(self, invitation: Invitation):
        return self.service_not_available(invitation)

    def send_whatsapp(self, invitation: Invitation):
        return self.service_not_available(invitation)

    def send_twitter(self, invitation: Invitation):
        return self.service_not_available(invitation)
