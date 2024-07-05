from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.utils.translation import gettext as _
from django.conf import settings
from django.utils import timezone

from main.models import Family, FamilyMembers
from .models import Event, Invitation
from .serializers import EventSerializer


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


class InvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            code = request.query_params.get('code', None)

            if code is None:
                return Response({"detail": "Invitation Code is required."}, status=status.HTTP_400_BAD_REQUEST)

            invitation = Invitation.objects.get(invitation_code=code)

            if invitation.expires_at < timezone.now():
                return Response({"detail": "Invitation expired."}, status=status.HTTP_400_BAD_REQUEST)

            family = invitation.family
            if family.members.filter(pk=user.pk).exists():
                return Response(
                    {"message": f"You already a member of {family.name} family.", "family_id": family.pk},
                    status=status.HTTP_200_OK
                )
            family.members.add(user)
            return Response(
                {"message": f"Welcome to {family.name} family.", "family_id": family.pk},
                status=status.HTTP_200_OK
            )

        except Invitation.DoesNotExist:
            return Response({"detail": "Invitation is invalid."}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(str(e))
            return Response({"detail": f"An unexpected error occurred"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request: Request, format=None, *args, **kwargs) -> Response:
        user = request.user
        data = request.data.copy()
        family_id = data.get("family")
        email = data.get("email")

        if not family_id or not email:
            return Response({"detail": "Family ID and email are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            family = Family.objects.get(pk=family_id, is_active=True, members__in=[user])
            family_member = FamilyMembers.objects.get(family=family, member=user, is_active=True)

            invitation = Invitation.objects.create(
                family_id=family.id,
                invited_by=family_member,
                send_to_email=email
            )
            invitation.set_invitation_code()

            email_subject = _(f"Invitation to Join the {family.name} Family")
            email_body = f"""
                Dear {email},

                You have been cordially invited to join the {family.name} family.

                Please click on the link below to accept the invitation and join our family:
                {settings.FRONTEND_URL}/invitations/{invitation.invitation_code}/

                This invitation link will expire after 2 Hour.

                We look forward to welcoming you to our family.

                Best regards,
                The {family.name} Family
            """

            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"message": "Invitation sent successfully."}, status=status.HTTP_200_OK)
        except FamilyMembers.DoesNotExist:
            return Response({'detail': 'You are not a member of this family.'}, status=status)
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with the given ID not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response({"detail": f"An unexpected error occurred"}, status=status.HTTP_400_BAD_REQUEST)
