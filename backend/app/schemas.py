from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator, model_validator


class TaskMessageCreate(BaseModel):
    task_id: str
    user_name: str
    message: str = ''
    file_url: str | None = None
    file_name: str | None = None
    content_type: str | None = None

    @field_validator('task_id', 'user_name')
    @classmethod
    def validate_required_text(cls, value):
        trimmed = str(value or '').strip()
        if not trimmed:
            raise ValueError('Field is required.')
        return trimmed

    @field_validator('message', mode='before')
    @classmethod
    def normalize_message(cls, value):
        if value is None:
            return ''
        return str(value).strip()

    @field_validator('file_url', mode='before')
    @classmethod
    def normalize_file_url(cls, value):
        if value is None:
            return None
        trimmed = str(value).strip()
        return trimmed or None

    @field_validator('file_name', 'content_type', mode='before')
    @classmethod
    def normalize_optional_text(cls, value):
        if value is None:
            return None
        trimmed = str(value).strip()
        return trimmed or None

    @model_validator(mode='after')
    def validate_message_or_file(self):
        if not self.message and not self.file_url:
            raise ValueError('Message or file_url is required.')
        return self


class TaskMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: str
    user_name: str
    message: str
    file_url: str | None
    file_name: str | None
    content_type: str | None
    created_at: datetime


class UploadResponse(BaseModel):
    file_url: str
    file_name: str
    content_type: str
