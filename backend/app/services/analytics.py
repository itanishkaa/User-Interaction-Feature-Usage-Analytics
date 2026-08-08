"""
Pandas-based analytics calculations over a dataset's events.

Each function takes a DataFrame with (at least) these columns:
  user_id, event_name, feature_category, session_id, device_type,
  browser, os, timestamp (tz-aware datetime)

Kept as plain functions operating on DataFrames (rather than methods on the
ORM layer) so they're trivially unit-testable without a DB.
"""
from __future__ import annotations

import pandas as pd


def compute_kpis(df: pd.DataFrame) -> dict:
    total_active_users = df["user_id"].nunique()
    total_events = len(df)
    total_sessions = df["session_id"].nunique()

    session_span = df.groupby("session_id")["timestamp"].agg(
        lambda ts: (ts.max() - ts.min()).total_seconds()
    )
    avg_session_duration_sec = float(session_span.mean()) if len(session_span) else 0.0
    bounce_rate = float((session_span == 0).mean()) if len(session_span) else 0.0

    # Retention rate here = share of users active on more than one distinct
    # calendar day (i.e. they came back at least once).
    active_days_per_user = df.groupby("user_id")["timestamp"].apply(
        lambda ts: ts.dt.date.nunique()
    )
    retention_rate = float((active_days_per_user > 1).mean()) if len(active_days_per_user) else 0.0

    avg_events_per_user = total_events / total_active_users if total_active_users else 0.0

    daily_active = df.groupby(df["timestamp"].dt.date)["user_id"].nunique()
    dau_avg = float(daily_active.mean()) if len(daily_active) else 0.0

    monthly_active = df.groupby(
        df["timestamp"].dt.tz_localize(None).dt.to_period("M")
    )["user_id"].nunique()
    mau_avg = float(monthly_active.mean()) if len(monthly_active) else 0.0

    return {
        "total_active_users": int(total_active_users),
        "total_events": int(total_events),
        "total_sessions": int(total_sessions),
        "avg_session_duration_sec": round(avg_session_duration_sec, 2),
        "bounce_rate": round(bounce_rate, 4),
        "retention_rate": round(retention_rate, 4),
        "avg_events_per_user": round(avg_events_per_user, 2),
        "dau_avg": round(dau_avg, 2),
        "mau_avg": round(mau_avg, 2),
    }


def compute_funnel(df: pd.DataFrame, steps: list[str]) -> list[dict]:
    """
    Cumulative funnel: a user "reaches" step N if they performed step N's
    event AND every prior step's event at least once (order of the events'
    timestamps relative to each other isn't enforced — this counts
    completion, not strict in-order sequencing).
    """
    if not steps:
        return []

    results = []
    cohort: set | None = None
    first_step_count = None

    for i, step in enumerate(steps):
        users_this_step = set(df.loc[df["event_name"] == step, "user_id"])
        cohort = users_this_step if cohort is None else (cohort & users_this_step)
        count = len(cohort)

        if i == 0:
            first_step_count = count
            pct_of_previous = 100.0
        else:
            prev_count = results[-1]["users"]
            pct_of_previous = (count / prev_count * 100.0) if prev_count else 0.0

        pct_of_first = (count / first_step_count * 100.0) if first_step_count else 0.0

        results.append({
            "step": step,
            "users": count,
            "pct_of_first_step": round(pct_of_first, 2),
            "pct_of_previous_step": round(pct_of_previous, 2),
        })

    return results


def compute_retention(df: pd.DataFrame) -> list[dict]:
    """
    Weekly-cohort D1/D7/D30 retention. A user's cohort is the Monday-start
    week of their first event ("signup" proxy, per PRD 4.5). D1/D7/D30
    retention is checked only for cohorts old enough that the check date has
    actually occurred within the dataset's date range — otherwise a recent
    cohort would look like it has 0% D30 retention just because 30 days
    haven't passed yet, which would be misleading rather than informative.
    """
    if df.empty:
        return []

    max_date = df["timestamp"].dt.date.max()

    first_seen = df.groupby("user_id")["timestamp"].min()
    active_dates = df.groupby("user_id")["timestamp"].apply(lambda ts: set(ts.dt.date))

    rows = []
    for user_id, first_ts in first_seen.items():
        first_date = first_ts.date()
        cohort_week = (first_ts - pd.Timedelta(days=first_ts.weekday())).date().isoformat()
        user_active_dates = active_dates[user_id]

        row = {"user_id": user_id, "cohort_week": cohort_week}
        for label, offset in (("day1", 1), ("day7", 7), ("day30", 30)):
            check_date = first_date + pd.Timedelta(days=offset)
            eligible = check_date <= max_date
            row[f"{label}_eligible"] = eligible
            row[f"{label}_active"] = eligible and (check_date in user_active_dates)
        rows.append(row)

    cohort_df = pd.DataFrame(rows)

    output = []
    for cohort_week, group in cohort_df.groupby("cohort_week"):
        entry = {"cohort_week": cohort_week, "cohort_size": len(group)}
        for label in ("day1", "day7", "day30"):
            eligible_group = group[group[f"{label}_eligible"]]
            if len(eligible_group) == 0:
                entry[f"{label}_retention"] = None
            else:
                entry[f"{label}_retention"] = round(
                    float(eligible_group[f"{label}_active"].mean()) * 100.0, 2
                )
        output.append(entry)

    output.sort(key=lambda r: r["cohort_week"])
    return output

def compute_feature_adoption(df: pd.DataFrame, top_n: int = 10) -> list[dict]:
    """
    Top-used features by event volume, per PRD 4.4. Events with no
    feature_category (nullable in the ingestion contract) are bucketed as
    "Uncategorized" rather than dropped, so usage isn't silently undercounted.
    """
    total_events = len(df)
    if total_events == 0:
        return []

    grouped = (
        df.assign(feature=df["feature_category"].fillna("Uncategorized"))
        .groupby("feature")
        .agg(event_count=("event_name", "count"), unique_users=("user_id", "nunique"))
        .reset_index()
        .sort_values("event_count", ascending=False)
        .head(top_n)
    )

    return [
        {
            "feature": str(row.feature),
            "event_count": int(row.event_count),
            "unique_users": int(row.unique_users),
            "pct_of_total_events": round(float(row.event_count) / total_events * 100, 2),
        }
        for row in grouped.itertuples(index=False)
    ]


def _platform_counts(df: pd.DataFrame, column: str) -> list[dict]:
    total = len(df)
    if total == 0:
        return []
    counts = df[column].fillna("Unknown").value_counts()
    return [
        {"label": str(label), "count": int(count), "pct": round(float(count) / total * 100, 2)}
        for label, count in counts.items()
    ]


def compute_platform_breakdown(df: pd.DataFrame) -> dict:
    """
    Device/browser/OS breakdown plus hour-of-day usage, per PRD 4.4. All 24
    hours are always returned (zero-filled) so the frontend can render a
    complete axis rather than gaps for hours with no events.
    """
    hour_counts = df["timestamp"].dt.hour.value_counts() if len(df) else {}
    by_hour = [
        {"hour": h, "event_count": int(hour_counts.get(h, 0))}
        for h in range(24)
    ]

    return {
        "by_device": _platform_counts(df, "device_type"),
        "by_browser": _platform_counts(df, "browser"),
        "by_os": _platform_counts(df, "os"),
        "by_hour": by_hour,
    }
