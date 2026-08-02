import csv
import io

import pandas as pd
from fastapi import APIRouter, Depends, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_dataset, get_db
from app.models.dataset import Dataset
from app.models.event import Event
from app.models.user import User
from app.schemas.dataset import (
    DatasetRead,
    DatasetUploadResponse,
    EventRead,
    PaginatedEvents,
)
from app.services.ingestion import validate_and_parse

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("/", response_model=list[DatasetRead])
def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Dataset)
        .filter(Dataset.owner_id == current_user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )


@router.post("/upload", response_model=DatasetUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile,
    name: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await validate_and_parse(file)
    df = result.df

    dataset = Dataset(
        name=name or (file.filename or "untitled dataset"),
        owner_id=current_user.id,
        row_count=len(df),
    )
    db.add(dataset)
    db.flush()  # assigns dataset.id without committing yet

    events = [
        Event(
            dataset_id=dataset.id,
            user_id=row.user_id,
            event_name=row.event_name,
            feature_category=row.feature_category,
            session_id=row.session_id,
            device_type=row.device_type,
            browser=row.browser,
            os=row.os,
            timestamp=row.timestamp,
        )
        for row in df.itertuples(index=False)
    ]
    db.bulk_save_objects(events)
    db.commit()
    db.refresh(dataset)

    return DatasetUploadResponse(
        dataset=DatasetRead.model_validate(dataset),
        rows_ingested=len(df),
        rows_dropped=result.rows_dropped,
        total_rows_in_file=result.total_rows_seen,
    )


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
):
    db.delete(dataset)  # cascades to events, per the Dataset model's relationship
    db.commit()
    return None


@router.get("/{dataset_id}/events")
def get_events(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000),
    event_name: str | None = None,
    feature_category: str | None = None,
    device_type: str | None = None,
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """Searchable, paginated event explorer (PRD 4.4), with CSV export."""
    query = db.query(Event).filter(Event.dataset_id == dataset.id)
    if event_name:
        query = query.filter(Event.event_name == event_name)
    if feature_category:
        query = query.filter(Event.feature_category == feature_category)
    if device_type:
        query = query.filter(Event.device_type == device_type)

    if format == "csv":
        rows = query.order_by(Event.timestamp.desc()).all()
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            "user_id", "event_name", "feature_category", "session_id",
            "device_type", "browser", "os", "timestamp",
        ])
        for e in rows:
            writer.writerow([
                e.user_id, e.event_name, e.feature_category, e.session_id,
                e.device_type, e.browser, e.os, e.timestamp.isoformat(),
            ])
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="dataset_{dataset.id}_events.csv"'},
        )

    total = query.with_entities(func.count()).scalar()
    rows = (
        query.order_by(Event.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedEvents(
        total=total,
        page=page,
        page_size=page_size,
        items=[EventRead.model_validate(r) for r in rows],
    )
