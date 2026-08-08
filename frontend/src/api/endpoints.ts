import {
  ChatMessage,
  ChatResponse,
  Dataset,
  DatasetUploadResponse,
  FunnelResponse,
  GenerateSummaryResponse,
  KPIResponse,
  PaginatedEvents,
  RetentionResponse,
  Token,
  User,
} from "@/types/api";
import { apiClient } from "./client";

export async function login(email: string, password: string): Promise<Token> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const { data } = await apiClient.post<Token>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function register(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", {
    email,
    password,
  });
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function listDatasets(): Promise<Dataset[]> {
  const { data } = await apiClient.get<Dataset[]>("/datasets");
  return data;
}

export async function uploadDataset(
  file: File,
  name?: string,
): Promise<DatasetUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const params = name ? { name } : undefined;
  const { data } = await apiClient.post<DatasetUploadResponse>(
    "/datasets/upload",
    form,
    {
      params,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function deleteDataset(datasetId: number): Promise<void> {
  await apiClient.delete(`/datasets/${datasetId}`);
}

export interface EventsQuery {
  page?: number;
  page_size?: number;
  event_name?: string;
  feature_category?: string;
  device_type?: string;
}

export async function getEvents(
  datasetId: number,
  query: EventsQuery = {},
): Promise<PaginatedEvents> {
  const { data } = await apiClient.get<PaginatedEvents>(
    `/datasets/${datasetId}/events`,
    {
      params: query,
    },
  );
  return data;
}

export async function exportEventsCsv(
  datasetId: number,
  query: EventsQuery = {},
): Promise<void> {
  const response = await apiClient.get(`/datasets/${datasetId}/events`, {
    params: { ...query, format: "csv" },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `dataset_${datasetId}_events.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getKpis(datasetId: number): Promise<KPIResponse> {
  const { data } = await apiClient.get<KPIResponse>(
    `/analytics/${datasetId}/kpis`,
  );
  return data;
}

export async function getFunnel(
  datasetId: number,
  steps: string[],
): Promise<FunnelResponse> {
  const { data } = await apiClient.get<FunnelResponse>(
    `/analytics/${datasetId}/funnel`,
    {
      params: { steps: steps.join(",") },
    },
  );
  return data;
}

export async function getRetention(
  datasetId: number,
): Promise<RetentionResponse> {
  const { data } = await apiClient.get<RetentionResponse>(
    `/analytics/${datasetId}/retention`,
  );
  return data;
}

export async function generateSummary(
  datasetId: number,
): Promise<GenerateSummaryResponse> {
  const { data } = await apiClient.post<GenerateSummaryResponse>(
    "/ai/generate-summary",
    {
      dataset_id: datasetId,
    },
  );
  return data;
}

export async function chatWithAi(
  datasetId: number,
  message: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/ai/chat", {
    dataset_id: datasetId,
    message,
    history,
  });
  return data;
}
