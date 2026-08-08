import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getFunnel } from "@/api/endpoints";
import { getApiErrorMessage } from "@/api/client";
import type { FunnelStep } from "@/types/api";
import PulseTrace from "@/components/PulseTrace";
import { tokens } from "@/theme/theme";

interface FunnelExplorerProps {
  datasetId: number;
}

const DEFAULT_STEPS = ["landing_viewed", "signup_started", "signup_completed"];

export default function FunnelExplorer({ datasetId }: FunnelExplorerProps) {
  const [steps, setSteps] = useState<string[]>(DEFAULT_STEPS);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<FunnelStep[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStep = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || steps.includes(trimmed)) {
      setDraft("");
      return;
    }
    setSteps((prev) => [...prev, trimmed]);
    setDraft("");
  };

  const removeStep = (step: string) => {
    setSteps((prev) => prev.filter((s) => s !== step));
  };

  const runFunnel = async () => {
    if (steps.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFunnel(datasetId, steps);
      setResults(res.steps);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Couldn't compute the funnel for these steps."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        {steps.map((step) => (
          <Chip
            key={step}
            label={step}
            onDelete={() => removeStep(step)}
            sx={{ bgcolor: tokens.paper, border: `1px solid ${tokens.border}` }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Box
          component="form"
          onSubmit={addStep}
          sx={{ display: "flex", gap: 1, flexGrow: 1 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Add an event name, e.g. checkout_completed"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="submit" variant="outlined" size="small">
            Add
          </Button>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={runFunnel}
          disabled={loading || steps.length === 0}
        >
          {loading ? "Running…" : "Run funnel"}
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ py: 3 }}>
          <PulseTrace variant="loading" width={140} />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && results && results.length > 0 && (
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={results}
              margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={tokens.border}
                vertical={false}
              />
              <XAxis
                dataKey="step"
                tick={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
                interval={0}
                angle={steps.some((s) => s.length > 14) ? -20 : 0}
                textAnchor={steps.some((s) => s.length > 14) ? "end" : "middle"}
                height={steps.some((s) => s.length > 14) ? 56 : 30}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}
                width={56}
              />
              <Tooltip
                formatter={(value: number, _name, entry) => [
                  `${value.toLocaleString()} users (${entry.payload.pct_of_first_step.toFixed(1)}% of step 1)`,
                  "Users",
                ]}
                labelStyle={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                {results.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? tokens.signalAmber : tokens.dataTeal}
                  />
                ))}
                <LabelList
                  dataKey="pct_of_first_step"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(0)}%`}
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 11,
                    fill: tokens.graphite,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {!loading && results && results.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No matching events found for these step names.
        </Typography>
      )}
    </Box>
  );
}
