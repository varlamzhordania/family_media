from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 100  # default
    page_size_query_param = 'page_size'  # allow override in URL
    max_page_size = 500  # safety limit
