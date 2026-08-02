from datetime import datetime

from pydantic import BaseModel, ConfigDict

class DatasetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    row_count: int
    created_at: datetime

class DatasetUploadResponse(BaseModel):
    dataset: DatasetRead
    rows_ingested: int
    rows_dropped: int
    total_rows_in_file: int

class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    event_name: str
    feature_category: str | None
    session_id: str
    device_type: str | None
    browser: str | None
    os: str | None
    timestamp: datetime

class PaginatedEvents(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EventRead]