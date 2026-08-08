import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Typography } from "@mui/material";
import type { FeatureAdoptionRow } from "@/types/api";
import { tokens } from "@/theme/theme";

interface FeatureAdoptionChartProps {
  features: FeatureAdoptionRow[];
}

export default function FeatureAdoptionChart({
  features,
}: FeatureAdoptionChartProps) {
  if (features.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No feature usage data available yet.
      </Typography>
    );
  }

  // Reverse so the highest-volume feature renders at the top of a
  // horizontal bar chart (recharts vertical layout plots bottom-up).
  const data = [...features].reverse();

  return (
    <Box sx={{ height: Math.max(220, data.length * 42) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={tokens.border}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={130}
            tick={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
          />
          <Tooltip
            formatter={(value: number, _name, entry) => [
              `${value.toLocaleString()} events · ${entry.payload.unique_users.toLocaleString()} users (${entry.payload.pct_of_total_events.toFixed(1)}%)`,
              "Usage",
            ]}
            labelStyle={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 12,
            }}
          />
          <Bar dataKey="event_count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === data.length - 1 ? tokens.signalAmber : tokens.dataTeal
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
