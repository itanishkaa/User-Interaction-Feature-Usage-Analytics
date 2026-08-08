import { tokens } from "@/theme/theme";
import { Box, Card, Typography } from "@mui/material";

interface KpiCardProps {
  label: string;
  value: string;
  accent?: "amber" | "teal";
}

export default function KpiCard({
  label,
  value,
  accent = "amber",
}: KpiCardProps) {
  const accentColor = accent === "amber" ? tokens.signalAmber : tokens.dataTeal;

  return (
    <Card
      sx={{ p: 2.25, height: "100%", position: "relative", overflow: "hidden" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3,
          height: "100%",
          bgcolor: accentColor,
        }}
      />
      <Typography variant="overline" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 28,
          fontWeight: 600,
          color: tokens.graphite,
          mt: 0.5,
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}
