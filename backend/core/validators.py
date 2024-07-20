from typing import Optional, Union

from django.core.files.uploadedfile import UploadedFile
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from django.conf import settings


@deconstructible
class ValidateFileSize:
    """
    Validator to check if the uploaded file exceeds the maximum allowed size.
    """
    message = _(
        "The maximum file size is %(max_size)s MB."
    )
    code = "invalid_file_size"

    def __init__(
            self,
            allowed_file_size: Optional[int] = None,
            message: Optional[str] = None,
            code: Optional[str] = None
    ) -> None:
        if allowed_file_size is not None:
            self.allowed_file_size = allowed_file_size * 1024 * 1024  # Convert MB to bytes
        else:
            self.allowed_file_size = settings.FILE_UPLOAD_MAX_MEMORY_SIZE

        if message is not None:
            self.message = message
        if code is not None:
            self.code = code

    def __call__(self, value: Optional[UploadedFile]) -> None:
        """
        Validates the size of the uploaded file.
        Raises a ValidationError if the file size exceeds the allowed size.
        """
        if value and value.size > self.allowed_file_size:
            raise ValidationError(
                self.message,
                code=self.code,
                params={'max_size': int(self.allowed_file_size / 1024 / 1024)}
            )
