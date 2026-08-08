import { getApiErrorMessage } from "@/api/client";
import { getKpis, getRetention } from "@/api/endpoints";
import AiInsightsPanel from "@/components/AiInsightsPanel";
import EmptyState from "@/components/EmptyState";
import FunnelExplorer from "@/components/FunnelExplorer";
import KpiCard from "@/components/KpiCard";
import PulseTrace from "@/components/PulseTrace";
import RetentionTable from "@/components/RetentionTable";
import SectionHeader from "@/components/SectionHeader";
import { useDatasets } from "@/contexts/DatasetContext";
import { CohortRow, KPIResponse } from "@/types/api";
import { Alert, Box, Card, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function formatSeconds(sec: number): string {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.round(sec % 60);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

export default function DashboardPage() {
  const { selectedDataset, isLoading: datasetsLoading } = useDatasets();

  const [kpis, setKpis] = useState<KPIResponse | null>(null);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDataset) {
      setKpis(null);
      setCohorts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getKpis(selectedDataset.id), getRetention(selectedDataset.id)])
      .then(([kpiRes, retentionRes]) => {
        if (cancelled) return;
        setKpis(kpiRes);
        setCohorts(retentionRes.cohorts);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          getApiErrorMessage(err, "Couldn't load analytics for this dataset."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDataset]);

  if (!datasetsLoading && !selectedDataset) {
    return (
      <EmptyState
        title="No dataset selected"
        description="Upload a usage-events file to see KPIs, funnels, retention, and AI-generated insights."
        actionLabel="Upload a dataset"
        actionTo="/datasets"
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <SectionHeader title="Overview" />
        {loading && (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <PulseTrace variant="loading" width={160} />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && kpis && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Active users"
                value={kpis.total_active_users.toLocaleString()}
                accent="amber"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Total events"
                value={kpis.total_events.toLocaleString()}
                accent="teal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Sessions"
                value={kpis.total_sessions.toLocaleString()}
                accent="amber"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Avg. session length"
                value={formatSeconds(kpis.avg_session_duration_sec)}
                accent="teal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Bounce rate"
                value={formatPct(kpis.bounce_rate)}
                accent="amber"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Retention rate"
                value={formatPct(kpis.retention_rate)}
                accent="teal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Avg. events / user"
                value={kpis.avg_events_per_user.toFixed(1)}
                accent="amber"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="DAU / MAU"
                value={`${kpis.dau_avg.toFixed(0)} / ${kpis.mau_avg.toFixed(0)}`}
                accent="teal"
              />
            </Grid>
          </Grid>
        )}
      </Box>
      {selectedDataset && (
        <Box>
          <SectionHeader title="AI insights" />
          <AiInsightsPanel datasetId={selectedDataset.id} />
        </Box>
      )}
      {selectedDataset && (
        <Box>
          <SectionHeader title="Funnel" />
          <Card sx={{ p: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define an ordered sequence of event names to see where users drop
              off.
            </Typography>
            <FunnelExplorer datasetId={selectedDataset.id} />
          </Card>
        </Box>
      )}
      <Box>
        <SectionHeader title="Retention cohorts" />
        <Card sx={{ p: 2.5 }}>
          {!loading && <RetentionTable cohorts={cohorts} />}
        </Card>
      </Box>
    </Box>
  );
}
