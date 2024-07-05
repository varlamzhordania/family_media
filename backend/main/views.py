from django.shortcuts import render, get_object_or_404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.db import transaction

from .models import Family, FamilyMembers, FamilyTree
from .serializers import FamilySerializer, FamilyTreeSerializer
from .helpers import have_permission


class FamilyView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request: Request, format=None) -> Response:
        user = request.user
        data = request.data.copy()
        data['creator'] = user.id
        serializer = FamilySerializer(data=data, context={'request': request})

        if serializer.is_valid():
            family = serializer.save()
            family.members.add(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListJoinFamilyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, format=None, *args, **kwargs) -> Response:
        user = request.user
        queryset = Family.objects.filter(members__in=[user], is_active=True)
        serializer = FamilySerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        code = data.get('code', None)

        if not code:
            return Response({"error": "Invite code is required."}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response({"message": f"You joined the {family.name} family."}, status=status.HTTP_200_OK)


class RetrieveUpdateLeaveFamilyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, pk, *args, **kwargs) -> Response:
        try:
            family = Family.objects.get(pk=pk, is_active=True)
            serializer = FamilySerializer(instance=family, many=False, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Family.DoesNotExist:
            return Response({"detail": "Family with given id not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def patch(self, request: Request, pk, format=None, *args, **kwargs) -> Response:
        try:
            user = request.user
            family = Family.objects.get(pk=pk, is_active=True)
            if have_permission(user, family):
                serializer = FamilySerializer(family, data=request.data, context={'request': request}, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        except Family.DoesNotExist:
            return Response({"detail": "Family with given id not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def delete(self, request: Request, pk, *args, **kwargs) -> Response:
        user = request.user
        family = get_object_or_404(Family, pk=pk, is_active=True)

        if not family.members.filter(id=user.id).exists():
            return Response({"error": "You are not a member of this family."}, status=status.HTTP_400_BAD_REQUEST)

        family.members.remove(user)
        family.save()

        return Response({"message": f"You left the {family.name} family."}, status=status.HTTP_204_NO_CONTENT)


class InviteView(APIView):
    permission_classes = [IsAuthenticated]

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
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)


class FamilyGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk, *args, **kwargs) -> Response:
        user = request.user
        try:
            family = Family.objects.get(pk=pk, is_active=True, members__in=[user])
            if family.creator != user:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

            action = request.data.get("action")
            rank = request.data.get("rank")
            member = request.data.get("member")

            if not action:
                return Response({"detail": "Field 'action' required."}, status=status.HTTP_400_BAD_REQUEST)
            if not rank:
                return Response({"detail": "Field 'rank' required."}, status=status.HTTP_400_BAD_REQUEST)
            if not member:
                return Response({"detail": "Field 'member' required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                member_user = family.members.get(pk=member)
            except FamilyMembers.DoesNotExist:
                return Response({"detail": "Family member not found."}, status=status.HTTP_404_NOT_FOUND)

            message = f"{member_user.get_full_name} {action}d to {rank}."

            if action == "promote" and rank == "admin":
                family.admins.add(member_user)
            elif action == "demote" and rank == "admin":
                family.admins.remove(member_user)
            else:
                return Response({"detail": "Invalid action or rank."}, status=status.HTTP_406_NOT_ACCEPTABLE)

            return Response({"message": message}, status=status.HTTP_200_OK)

        except Family.DoesNotExist:
            return Response(
                {"detail": "Family with given id not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(e)
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)


class FamilyTreeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FamilyTreeSerializer

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
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)

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
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)
