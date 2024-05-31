from django.db import models
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.utils.deconstruct import deconstructible
from django.utils import timezone
import re


class BaseModel(models.Model):
    created_at = models.DateTimeField(verbose_name=_("Date Created"), auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(verbose_name=_("Date Updated"), auto_now=True)
    is_active = models.BooleanField(verbose_name=_("Is Active"), default=True)

    class Meta:
        abstract = True


@deconstructible
class UploadPath:
    def __init__(self, folder, sub_path):
        self.folder = folder
        self.sub_path = sub_path

    def __call__(self, instance, filename):
        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        extension = filename.split(".")[-1]
        return f"{self.folder}/{self.sub_path}/{timestamp}.{extension}"


def is_admin(user):
    return user.is_superuser or user.is_staff or user.groups.filter(name="admin").exists()


def fancy_message(request, body, level="info"):
    level_mapping = {
        "success": messages.SUCCESS,
        "error": messages.ERROR,
        "warning": messages.WARNING,
        "info": messages.INFO,
    }
    if isinstance(body, dict):
        for field_name, error_list in body.items():
            for error in error_list:
                messages.add_message(request, level_mapping[level], f"{field_name}: {error}")
    elif isinstance(body, str):
        messages.add_message(request, level_mapping[level], body)
    else:
        raise ValueError("Unsupported message body type")


def string_to_context(input_string):
    # Define a regular expression pattern to match context variables like '{{ variable_name }}'
    pattern = r'\{\{([\w\s\?,]+)\}\}'

    # Use regular expressions to find all matches in the input string
    matches = re.findall(pattern, input_string)

    # Create a context dictionary to store variable names and their values
    context = {}

    for match in matches:
        # Split the match into variable name and value using ','
        parts = match.split(',')

        # The first part is the variable name (trimmed of whitespace)
        variable_name = parts[0].strip()

        # The second part (if present) is the value (trimmed of whitespace)
        variable_value = parts[1].strip() if len(parts) > 1 else ''

        # Add the variable and its value to the context dictionary
        context[variable_name] = variable_value

    return context
