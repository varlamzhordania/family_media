from rest_framework import serializers
from .models import Family, FamilyMembers, FamilyRelation


class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = '__all__'


class FamilyMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMembers
        fields = '__all__'


class FamilyRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyRelation
        fields = '__all__'
