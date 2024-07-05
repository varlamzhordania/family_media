from rest_framework import serializers
from django.utils.timesince import timesince

from .models import Family, FamilyMembers, FamilyRelation, FamilyTree

from accounts.serializers import PublicUserSerializer


class FamilySerializer(serializers.ModelSerializer):
    established = serializers.SerializerMethodField()
    members = PublicUserSerializer(many=True, read_only=True)

    class Meta:
        model = Family
        fields = '__all__'

    def get_established(self, obj):
        time_elapsed = timesince(obj.created_at)
        return f"established {time_elapsed} ago"


class FamilyMembersSerializer(serializers.ModelSerializer):
    family = FamilySerializer(read_only=True)

    class Meta:
        model = FamilyMembers
        fields = '__all__'


class FamilyRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyRelation
        fields = '__all__'


class RecursiveField(serializers.Serializer):
    def to_representation(self, data):
        return FamilyTreeSerializer(data,context=self.context).data


class FamilyTreeSerializer(serializers.ModelSerializer):
    children = RecursiveField(many=True, required=False)

    class Meta:
        model = FamilyTree
        exclude = ['lft', 'rght', 'tree_id', 'level']
