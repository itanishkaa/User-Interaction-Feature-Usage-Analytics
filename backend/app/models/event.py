from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.dataset import Dataset


class Event(Base):
    """
    One row per uploaded analytics event, matching the PRD's ingestion
    contract (section 3). `user_id` here is the *end-user of the uploaded
    product data* (e.g. "usr_1456") — not an app.User account — so it's a
    plain string column, not a foreign key.
    """

    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("datasets.id"), nullable=False, index=True
    )

    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    event_name: Mapped[str] = mapped_column(String(128), nullable=False)
    feature_category: Mapped[str | None] = mapped_column(String(128), nullable=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    device_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(64), nullable=True)
    os: Mapped[str | None] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

    dataset: Mapped["Dataset"] = relationship(back_populates="events")
