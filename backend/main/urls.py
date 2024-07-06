from django.urls import path
from .views import FamilyView, ListJoinFamilyView, RetrieveUpdateLeaveFamilyView, InviteView, FamilyGroupsView, \
    FamilyTreeView


app_name = 'main'

urlpatterns = [
    path("family/", FamilyView.as_view(), name='family_view'),
    path("families/", ListJoinFamilyView.as_view(), name='family_list_join'),
    path("families/<int:pk>/", RetrieveUpdateLeaveFamilyView.as_view(), name='family_retrieve_update_leave'),
    path("families/invite/<int:pk>/", InviteView.as_view(), name='family_invite'),
    path("families/groups/<int:pk>/", FamilyGroupsView.as_view(), name='family_groups'),
    path("families/tree/<int:pk>/", FamilyTreeView.as_view(), name='family_tree'),
]
