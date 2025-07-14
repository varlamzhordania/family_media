from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiTypes

from main.models import Family, FamilyMembers, FamilyTree
from main.helpers import have_permission

from .serializers import (
    FamilySerializer, FamilyTreeSerializer, JoinFamilyInputSerializer,
    FamilyGroupActionSerializer,
)


@extend_schema(tags=['Family'])
class FamilyView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FamilySerializer

    @extend_schema(
        summary="Create a family",
        description="Creates a new family and adds the current user as a member.",
        request=FamilySerializer,
        responses={
            201: OpenApiResponse(
                response=FamilySerializer,
                description="Family created successfully."
            ),
            400: OpenApiResponse(description="Validation error in request data."),
        }
    )
    @transaction.atomic
    def post(self, request: Request, format=None) -> Response:
        user = request.user
        data = request.data.copy()
        data['creator'] = user.id
        serializer = self.serializer_class(data=data, context={'request': request})

        if serializer.is_valid():
            family = serializer.save()
            family.members.add(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Family'])
class ListJoinFamilyView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List joined families",
        description="Returns a list of families the user is currently a member of.",
        responses={
            200: OpenApiResponse(
                response=FamilySerializer(many=True),
                description="List of joined families"
            )
        }
    )
    def get(self, request: Request, format=None, *args, **kwargs) -> Response:
        user = request.user
        queryset = Family.objects.filter(members__in=[user], is_active=True)
        serializer = FamilySerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Join a family via invite code",
        description="Allows a user to join an existing family using an invitation code.",
        request=JoinFamilyInputSerializer,
        responses={
            200: OpenApiResponse(description="Successfully joined or already a member."),
            400: OpenApiResponse(description="Missing invite code."),
            404: OpenApiResponse(description="Invalid invite code."),
        }
    )
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = JoinFamilyInputSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        code = serializer.validated_data.get('code', None)

        if not code:
            return Response(
                {"error": "Invite code is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            family = Family.objects.get(invite_code=code, is_active=True)
        except Family.DoesNotExist:
            return Response({"error": "Invalid invite code."}, status=status.HTTP_404_NOT_FOUND)

        if family.members.filter(id=user.id).exists():
            return Response(
                {"message": f"You are already a member of {family.name} family."},
                status=status.HTTP_200_OK
            )

        family.members.add(user)
        return Response(
            {"message": f"You joined the {family.name} family."},
            status=status.HTTP_200_OK
        )


@extend_schema(tags=['Family'])
class RetrieveUpdateLeaveFamilyView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Retrieve a family by ID",
        description="Fetches details of a family by its ID.",
        responses={
            200: OpenApiResponse(response=FamilySerializer),
            404: OpenApiResponse(description="Family not found."),
            400: OpenApiResponse(description="Other errors.")
        }
    )
    def get(self, request: Request, pk, *args, **kwargs) -> Response:
        try:
            family = Family.objects.get(pk=pk, is_active=True)
            serializer = FamilySerializer(instance=family, many=False, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Update a family",
        description="Partially updates a family's information. Only the creator or authorized users can edit.",
        request=FamilySerializer,
        responses={
            200: OpenApiResponse(response=FamilySerializer),
            400: OpenApiResponse(description="Validation error or unexpected exception."),
            403: OpenApiResponse(description="Access denied."),
            404: OpenApiResponse(description="Family not found.")
        }
    )
    @transaction.atomic
    def patch(self, request: Request, pk, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            family = Family.objects.get(pk=pk, is_active=True)
            if have_permission(user, family):
                serializer = FamilySerializer(
                    family,
                    data=request.data,
                    context={'request': request},
                    partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Leave or disband a family",
        description=(
                "Deletes the family if the current user is the creator, or removes the user from the family otherwise."
        ),
        responses={
            204: OpenApiResponse(description="Successfully left or deleted the family."),
            400: OpenApiResponse(description="User is not a member of the family."),
            404: OpenApiResponse(description="Family not found.")
        }
    )
    @transaction.atomic
    def delete(self, request: Request, pk, *args, **kwargs) -> Response:
        user = request.user
        family = get_object_or_404(Family, pk=pk, is_active=True)

        if not family.members.filter(id=user.id).exists():
            return Response(
                {"error": "You are not a member of this family."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if family.creator == request.user:
            family.delete()
            return Response(
                {"message": f"{family.name} disbanded."},
                status=status.HTTP_204_NO_CONTENT
            )
        else:
            family.members.remove(user)
            return Response(
                {"message": f"You left the {family.name} family."},
                status=status.HTTP_204_NO_CONTENT
            )


@extend_schema(tags=['Family'])
class InviteView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Generate an invite code for a family",
        description="Generates or retrieves an invite code for a family. Only the creator or authorized members can request it.",
        responses={
            200: OpenApiResponse(description="Invite code generated", response=OpenApiTypes.OBJECT),
            403: OpenApiResponse(description="Access denied"),
            404: OpenApiResponse(description="Family not found or access denied"),
            400: OpenApiResponse(description="Unexpected error"),
        }
    )
    def get(self, request: Request, pk, *args, **kwargs) -> Response:
        user = request.user
        try:
            family = Family.objects.get(pk=pk, is_active=True, members__in=[user])
            if have_permission(user, family):
                code = family.set_invite_code()
                return Response({"invite_code": code}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=['Family'])
class FamilyGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Promote/Demote a family member",
        description="Allows the family creator to promote or demote a member to/from admin.",
        request=FamilyGroupActionSerializer,
        responses={
            200: OpenApiResponse(description="Role updated successfully."),
            400: OpenApiResponse(description="Missing fields or unexpected error."),
            403: OpenApiResponse(description="Access denied. Only the creator can change roles."),
            404: OpenApiResponse(description="Family or member not found."),
            406: OpenApiResponse(description="Invalid action or rank."),
        }
    )
    @transaction.atomic
    def post(self, request, pk, *args, **kwargs) -> Response:
        user = request.user
        try:
            family = Family.objects.get(pk=pk, is_active=True, members__in=[user])
            if family.creator != user:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

            serializer = FamilyGroupActionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            action = serializer.validated_data["action"]
            rank = serializer.validated_data["rank"]
            member = serializer.validated_data["member"]

            try:
                member_user = family.members.get(pk=member)
            except FamilyMembers.DoesNotExist:
                return Response(
                    {"detail": "Family member not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            message = f"{member_user.get_full_name} {action}d to {rank}."

            if action == "promote" and rank == "admin":
                family.admins.add(member_user)
            elif action == "demote" and rank == "admin":
                family.admins.remove(member_user)
            else:
                return Response(
                    {"detail": "Invalid action or rank."},
                    status=status.HTTP_406_NOT_ACCEPTABLE
                )

            return Response({"message": message}, status=status.HTTP_200_OK)

        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=['Family'])
class FamilyTreeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FamilyTreeSerializer

    @extend_schema(
        summary="Get root family tree nodes",
        description="Retrieves top-level family tree nodes for a given family ID.",
        responses={
            200: FamilyTreeSerializer(many=True),
            404: OpenApiResponse(description="Family not found or access denied."),
            400: OpenApiResponse(description="Unexpected error.")
        }
    )
    def get(self, request: Request, pk: int, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            family = Family.objects.get(pk=pk, members__in=[user], is_active=True)
            tree_nodes = family.tree_nodes.filter(level=0)
            serializer = self.serializer_class(tree_nodes, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Create a family tree node",
        description="Creates a new node in the family tree for the given family ID. Only permitted users can create.",
        request=FamilyTreeSerializer,
        responses={
            201: FamilyTreeSerializer,
            400: OpenApiResponse(description="Validation or unexpected error."),
            403: OpenApiResponse(description="Access denied."),
            404: OpenApiResponse(description="Family not found or access denied."),
        }
    )
    @transaction.atomic
    def post(self, request: Request, pk: int, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            family = Family.objects.get(pk=pk, members__in=[user], is_active=True)
            if have_permission(user, family):
                serializer = self.serializer_class(data=request.data, context={'request': request})
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update a family tree node",
        description="Updates an existing family tree node by its ID (pk). Only permitted users can update.",
        request=FamilyTreeSerializer,
        responses={
            201: FamilyTreeSerializer,
            400: OpenApiResponse(description="Validation or unexpected error."),
            403: OpenApiResponse(description="Access denied."),
            404: OpenApiResponse(description="Node or Family not found.")
        }
    )
    @transaction.atomic
    def patch(self, request, pk: int, format=None, *args, **kwargs):
        try:
            user = request.user
            print(pk)
            family_tree: FamilyTree = FamilyTree.objects.get(pk=pk)
            if have_permission(user, family_tree.family):
                serializer = self.serializer_class(
                    family_tree,
                    data=request.data,
                    context={'request': request},
                    partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        except FamilyTree.DoesNotExist:
            return Response(
                {"detail": "Person with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete a family tree node",
        description="Deletes a family tree node by its ID. Only permitted users (e.g., family creator or admin) can perform this action.",
        responses={
            204: OpenApiResponse(description="Family tree node deleted successfully."),
            403: OpenApiResponse(description="Access denied."),
            404: OpenApiResponse(description="Node or Family not found."),
            400: OpenApiResponse(description="Unexpected error."),
        }
    )
    @transaction.atomic
    def delete(self, request: Request, pk: int, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            family_tree: FamilyTree = FamilyTree.objects.get(pk=pk)
            if have_permission(user, family_tree.family):
                family_tree.delete()
                return Response(
                    {"message": f"{family_tree.name} deleted from your family tree."},
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response({"detail": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        except FamilyTree.DoesNotExist:
            return Response(
                {"detail": "Person with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_400_BAD_REQUEST
            )
