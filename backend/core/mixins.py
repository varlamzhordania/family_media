from rest_framework.response import Response

class OptionalPaginationMixin:
    page_size_query_param = "page_size"  # allow client to change size per request

    def get_paginate_queryset(self, queryset):
        """
        Handles DRF's pagination logic.
        """
        if self.get_pagination_class() is None:
            return None
        return super().paginate_queryset(queryset)

    def get_pagination_class(self):
        """
        Returns None if ?pagination=false, otherwise returns pagination_class.
        """
        if self.request.query_params.get("pagination") == "false":
            return None
        return self.pagination_class

    def paginate_queryset(self, queryset):
        if self.get_pagination_class() is None:
            return None

        # If pagination class supports page_size_query_param, set it dynamically
        pagination = self.pagination_class()
        if hasattr(pagination, 'page_size_query_param'):
            pagination.page_size_query_param = self.page_size_query_param
        return super().paginate_queryset(queryset)

    def get_paginated_response(self, data):
        if self.get_pagination_class() is None:
            return Response(data)
        return super().get_paginated_response(data)
