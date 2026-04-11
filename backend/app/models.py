from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class TaskMessage(Base):
    __tablename__ = 'task_messages'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    user_name: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False, default='')
    file_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(512), nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
