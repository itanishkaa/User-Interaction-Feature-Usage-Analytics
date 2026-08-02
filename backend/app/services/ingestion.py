"""
Validates and parses uploaded event files against the PRD's ingestion
contract (section 3):
  user_id, event_name, feature_category, session_id, device_type,
  browser, os, timestamp
"""
from __future__ import annotations

import io

import pandas as pd
from fastapi import HTTPException, UploadFile, status

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB, per PRD section 4.2

REQUIRED_COLUMNS = {
    "user_id",
    "event_name",
    "feature_category",
    "session_id",
    "device_type",
    "browser",
    "os",
    "timestamp",
}

# Columns allowed to be blank at the cell level — everything else is required
# per-row (missing user_id/event_name/session_id/timestamp makes a row
# useless for analytics, so those rows are dropped rather than kept null).
NULLABLE_COLUMNS = {"feature_category", "device_type", "browser", "os"}


class IngestionResult:
    def __init__(self, df: pd.DataFrame, rows_dropped: int, total_rows_seen: int):
        self.df = df
        self.rows_dropped = rows_dropped
        self.total_rows_seen = total_rows_seen


def _read_dataframe(filename: str, raw_bytes: bytes) -> pd.DataFrame:
    lower = filename.lower()
    try:
        if lower.endswith(".csv"):
            return pd.read_csv(io.BytesIO(raw_bytes))
        elif lower.endswith((".xlsx", ".xls")):
            return pd.read_excel(io.BytesIO(raw_bytes))
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only .csv, .xlsx, and .xls files are supported",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Could not parse file: {exc}",
        ) from exc


async def validate_and_parse(file: UploadFile) -> IngestionResult:
    raw_bytes = await file.read()

    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB limit",
        )
    if not raw_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty"
        )

    df = _read_dataframe(file.filename or "", raw_bytes)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "message": "Uploaded file is missing required columns",
                "missing_columns": sorted(missing),
                "expected_columns": sorted(REQUIRED_COLUMNS),
            },
        )

    total_rows_seen = len(df)

    # Keep only the contract columns (ignore any extras the file might have)
    df = df[list(REQUIRED_COLUMNS)].copy()

    # Parse timestamp; unparsable values become NaT
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True)

    # A row is unusable for analytics if any *required* (non-nullable) field
    # is missing — drop those, but tolerate nulls in the nullable columns.
    required_for_row = list(REQUIRED_COLUMNS - NULLABLE_COLUMNS)
    before = len(df)
    df = df.dropna(subset=required_for_row)
    rows_dropped = before - len(df)

    # Normalize string columns: strip whitespace so downstream grouping isn't
    # fooled by trailing spaces (casing is left as-is — that's a cleaning
    # decision for the analytics layer / notebook, not ingestion's job)
    for col in ["user_id", "event_name", "feature_category", "session_id",
                "device_type", "browser", "os"]:
        df[col] = df[col].astype(str).where(df[col].notna(), None)
        df[col] = df[col].apply(lambda v: v.strip() if isinstance(v, str) else v)

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No valid rows remained after parsing — check timestamp format "
                   "and that user_id/event_name/session_id are populated",
        )

    return IngestionResult(df=df, rows_dropped=rows_dropped, total_rows_seen=total_rows_seen)
