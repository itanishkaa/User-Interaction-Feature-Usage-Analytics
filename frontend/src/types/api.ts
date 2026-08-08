export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: "bearer";
}

export interface Dataset {
  id: number;
  name: string;
  row_count: number;
  created_at: string;
}

export interface DatasetUploadResponse {
  dataset: Dataset;
  rows_ingested: number;
  rows_dropped: number;
  total_rows_in_file: number;
}

export interface EventRow {
  id: number;
  user_id: string;
  event_name: string;
  feature_category: string | null;
  session_id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  timestamp: string;
}

export interface PaginatedEvents {
  total: number;
  page: number;
  page_size: number;
  items: EventRow[];
}

export interface KPIResponse {
  total_active_users: number;
  total_events: number;
  total_sessions: number;
  avg_session_duration_sec: number;
  bounce_rate: number;
  retention_rate: number;
  avg_events_per_user: number;
  dau_avg: number;
  mau_avg: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  pct_of_first_step: number;
  pct_of_previous_step: number;
}

export interface FunnelResponse {
  steps: FunnelStep[];
}

export interface CohortRow {
  cohort_week: string;
  cohort_size: number;
  day1_retention: number | null;
  day7_retention: number | null;
  day30_retention: number | null;
}

export interface RetentionResponse {
  cohorts: CohortRow[];
}

export interface FeatureAdoptionRow {
  feature: string;
  event_count: number;
  unique_users: number;
  pct_of_total_events: number;
}

export interface FeatureAdoptionResponse {
  features: FeatureAdoptionRow[];
}

export interface PlatformCount {
  label: string;
  count: number;
  pct: number;
}

export interface HourlyUsage {
  hour: number;
  event_count: number;
}

export interface PlatformBreakdownResponse {
  by_device: PlatformCount[];
  by_browser: PlatformCount[];
  by_os: PlatformCount[];
  by_hour: HourlyUsage[];
}

export interface GenerateSummaryResponse {
  summary: string;
  metrics_used: Record<string, unknown>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ApiErrorBody {
  detail?: string;
}
