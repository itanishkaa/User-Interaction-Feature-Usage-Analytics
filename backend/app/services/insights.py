"""
AI Insights Engine (PRD 4.6).

Per the PRD's explicit scope boundary (section 2), only pre-aggregated
metric JSON is ever sent to the LLM — never raw event-level logs. This
keeps prompts small, keeps per-user data out of a third-party API call,
and matches the "Excluded / Deferred" row for direct raw log streaming.
"""
from __future__ import annotations

import json

from app.services.ai_client import generate_text

SUMMARY_SYSTEM_PROMPT = """\
You are a senior product analyst writing a short executive summary for a \
product team. You will be given a JSON object of pre-aggregated analytics \
metrics (KPIs, and optionally funnel and retention data). Write 4-6 concise \
bullet points covering: notable metrics, any adoption drop-offs or friction \
points visible in the funnel/retention data, and one concrete, actionable \
recommendation. Only reference numbers that appear in the JSON — never \
invent or estimate a figure that isn't given. If the data is too sparse to \
support a claim, say so plainly rather than speculating."""

QA_SYSTEM_PROMPT = """\
You are FeaturePulse's product analytics assistant. You will be given a JSON \
object of pre-aggregated analytics metrics for one dataset, plus a user's \
question. Answer using only the numbers present in that JSON. If the JSON \
doesn't contain what's needed to answer, say so directly instead of \
guessing or fabricating a number. Keep answers short and concrete."""


def build_metrics_context(
    kpis: dict,
    funnel: list[dict] | None = None,
    retention: list[dict] | None = None,
    top_features: dict | None = None,
) -> dict:
    context: dict = {"kpis": kpis}
    if top_features:
        context["top_feature_categories"] = top_features
    if funnel:
        context["funnel"] = funnel
    if retention:
        # Cap to the most recent cohorts so the prompt stays small even on
        # long-running datasets.
        context["retention_cohorts_recent"] = retention[-8:]
    return context


async def generate_executive_summary(metrics: dict) -> str:
    user_prompt = (
        "Pre-aggregated analytics metrics (JSON):\n\n"
        f"{json.dumps(metrics, default=str)}\n\n"
        "Write the executive summary now."
    )
    return await generate_text(SUMMARY_SYSTEM_PROMPT, user_prompt)


async def answer_question(question: str, metrics: dict, history: list[dict] | None = None) -> str:
    history_text = ""
    if history:
        transcript = "\n".join(f"{h['role']}: {h['content']}" for h in history)
        history_text = f"\nPrior conversation:\n{transcript}\n"

    user_prompt = (
        "Pre-aggregated analytics metrics (JSON):\n\n"
        f"{json.dumps(metrics, default=str)}\n"
        f"{history_text}\n"
        f"Question: {question}"
    )
    return await generate_text(QA_SYSTEM_PROMPT, user_prompt)
