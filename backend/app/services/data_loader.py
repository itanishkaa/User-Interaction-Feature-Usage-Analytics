import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event


def load_events_df(db: Session, dataset_id: int) -> pd.DataFrame:
    stmt = select(
        Event.user_id,
        Event.event_name,
        Event.feature_category,
        Event.session_id,
        Event.device_type,
        Event.browser,
        Event.os,
        Event.timestamp,
    ).where(Event.dataset_id == dataset_id)

    rows = db.execute(stmt).all()
    df = pd.DataFrame(
        rows,
        columns=[
            "user_id", "event_name", "feature_category", "session_id",
            "device_type", "browser", "os", "timestamp",
        ],
    )
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    return df
