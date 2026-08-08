import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Grid, Stack, Typography } from "@mui/material";
import type {
  HourlyUsage,
  PlatformBreakdownResponse,
  PlatformCount,
} from "@/types/api";
import { tokens } from "@/theme/theme";

interface PlatformBreakdownPanelProps {
  data: PlatformBreakdownResponse;
}

function MiniBarList({
  title,
  rows,
}: {
  title: string;
  rows: PlatformCount[];
}) {
  if (rows.length === 0) {
    return (
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="overline" sx={{ color: "text.secondary" }}>
        {title}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {rows.slice(0, 6).map((row) => (
          <Box key={row.label}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.25 }}
            >
              <Typography variant="body2">{row.label}</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: "text.secondary",
                }}
              >
                {row.pct.toFixed(1)}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: tokens.paper,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${Math.max(2, row.pct)}%`,
                  bgcolor: tokens.dataTeal,
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function HourlyUsageChart({ hours }: { hours: HourlyUsage[] }) {
  return (
    <Box sx={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={hours}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={tokens.border}
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tickFormatter={(h: number) => `${h}`}
            tick={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString()} events`,
              "Volume",
            ]}
            labelFormatter={(h: number) => `${h}:00–${h}:59`}
            labelStyle={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="event_count"
            fill={tokens.signalAmber}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default function PlatformBreakdownPanel({
  data,
}: PlatformBreakdownPanelProps) {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <MiniBarList title="Device" rows={data.by_device} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MiniBarList title="Browser" rows={data.by_browser} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MiniBarList title="OS" rows={data.by_os} />
        </Grid>
      </Grid>

      <Typography variant="overline" sx={{ color: "text.secondary" }}>
        Usage by hour of day
      </Typography>
      <HourlyUsageChart hours={data.by_hour} />
    </Box>
  );
}
