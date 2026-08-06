from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, get_dataset_or_404
from app.models.user import User
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    GenerateSummaryRequest,
    GenerateSummaryResponse,
)
from app.services.ai_client import AIConfigError
from app.services.analytics import compute_kpis
from app.services.data_loader import load_events_df
from app.services.insights import answer_question, build_metrics_context, generate_executive_summary

router = APIRouter(prefix="/ai", tags=["ai"])


def _load_metrics_context(db: Session, dataset_id: int, current_user: User) -> dict:
    dataset = get_dataset_or_404(db, dataset_id, current_user)
    df = load_events_df(db, dataset.id)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset has no events to analyze",
        )
    kpis = compute_kpis(df)
    top_features = (
        df["feature_category"].value_counts().head(10).to_dict()
    )
    return build_metrics_context(kpis, top_features=top_features)


@router.post("/generate-summary", response_model=GenerateSummaryResponse)
async def generate_summary(
    payload: GenerateSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    metrics = _load_metrics_context(db, payload.dataset_id, current_user)
    try:
        summary = await generate_executive_summary(metrics)
    except AIConfigError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 — surface upstream provider failures as a clean 502
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider request failed: {exc}",
        ) from exc

    return GenerateSummaryResponse(summary=summary, metrics_used=metrics)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    metrics = _load_metrics_context(db, payload.dataset_id, current_user)
    history = [h.model_dump() for h in payload.history]

    try:
        reply = await answer_question(payload.message, metrics, history)
    except AIConfigError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider request failed: {exc}",
        ) from exc

    return ChatResponse(reply=reply)
