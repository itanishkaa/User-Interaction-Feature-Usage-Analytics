from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_owned_dataset
from app.models.dataset import Dataset
from app.schemas.analytics import (
    CohortRow,
    FunnelResponse,
    FunnelStep,
    KPIResponse,
    RetentionResponse,
    PlatformBreakdownResponse,
    FeatureAdoptionRow,
    FeatureAdoptionResponse
)
from app.services.analytics import compute_funnel, compute_kpis, compute_retention, compute_feature_adoption, compute_platform_breakdown
from app.services.data_loader import load_events_df

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{dataset_id}/kpis", response_model=KPIResponse)
def get_kpis(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
):
    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )
    return KPIResponse(**compute_kpis(df))


@router.get("/{dataset_id}/funnel", response_model=FunnelResponse)
def get_funnel(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
    steps: str = Query(
        ..., description="Comma-separated ordered event names, e.g. landing_viewed,signup_started,signup_completed"
    ),
):
    step_list = [s.strip() for s in steps.split(",") if s.strip()]
    if not step_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one step in the `steps` query param",
        )

    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )

    results = compute_funnel(df, step_list)
    return FunnelResponse(steps=[FunnelStep(**r) for r in results])


@router.get("/{dataset_id}/retention", response_model=RetentionResponse)
def get_retention(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
):
    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )

    cohorts = compute_retention(df)
    return RetentionResponse(cohorts=[CohortRow(**c) for c in cohorts])

@router.get("/{dataset_id}/feature-adoption", response_model=FeatureAdoptionResponse)
def get_feature_adoption(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
    top_n: int = Query(10, ge=1, le=50),
):
    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )

    rows = compute_feature_adoption(df, top_n=top_n)
    return FeatureAdoptionResponse(features=[FeatureAdoptionRow(**r) for r in rows])


@router.get("/{dataset_id}/platform-breakdown", response_model=PlatformBreakdownResponse)
def get_platform_breakdown(
    dataset: Dataset = Depends(get_owned_dataset),
    db: Session = Depends(get_db),
):
    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )

    return PlatformBreakdownResponse(**compute_platform_breakdown(df))
