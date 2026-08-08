from pydantic import BaseModel

class KPIResponse(BaseModel):
    total_active_users: int
    total_events: int
    total_sessions: int
    avg_session_duration_sec: float
    bounce_rate: float
    retention_rate: float
    avg_events_per_user: float
    dau_avg: float
    mau_avg: float

class FunnelStep(BaseModel):
    step: str
    users: int
    pct_of_first_step: float
    pct_of_previous_step: float

class FunnelResponse(BaseModel):
    steps: list[FunnelStep]

class CohortRow(BaseModel):
    cohort_week: str
    cohort_size: int
    day1_retention: float | None
    day7_retention: float | None
    day30_retention: float | None

class RetentionResponse(BaseModel):
    cohorts: list[CohortRow]

class FeatureAdoptionRow(BaseModel):
    feature: str
    event_count: int
    unique_users: int
    pct_of_total_events: float

class FeatureAdoptionResponse(BaseModel):
    features: list[FeatureAdoptionRow]

class PlatformCount(BaseModel):
    label: str
    count: int
    pct: float

class HourlyUsage(BaseModel):
    hour: int
    event_count: int

class PlatformBreakdownResponse(BaseModel):
    by_device: list[PlatformCount]
    by_browser: list[PlatformCount]
    by_os: list[PlatformCount]
    by_hour: list[HourlyUsage]