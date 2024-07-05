from typing import Optional, Union

from django.core.files.uploadedfile import UploadedFile
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from django.conf import settings


@deconstructible
class ValidateFileSize:
    message: str = _(
        "The maximum file size is “%(max_size)sMB”."
    )
    code: str = "invalid_file_size"

    def __init__(
            self,
            allowed_file_size: Optional[int] = None,
            message: Optional[str] = None,
            code: Optional[str] = None
    ) -> None:
        if allowed_file_size is not None:
            self.allowed_file_size = allowed_file_size * 1024 * 1024
        else:
            self.allowed_file_size = settings.FILE_UPLOAD_MAX_MEMORY_SIZE

        if message is not None:
            self.message = message
        if code is not None:
            self.code = code

    def __call__(self, value: Union[UploadedFile, None]) -> None:
        if value and value.size > self.allowed_file_size:
            raise ValidationError(
                self.message,
                code=self.code,
                params={
                    'max_size': int(self.allowed_file_size / 1024 / 1024),
                    "value": value,
                },
            )
