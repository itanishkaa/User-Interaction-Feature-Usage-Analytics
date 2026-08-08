import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PulseTrace from "./PulseTrace";
import { tokens } from "@/theme/theme";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 10,
        px: 3,
        border: `1px dashed ${tokens.border}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ opacity: 0.5, mb: 2 }}>
        <PulseTrace variant="divider" width={140} />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 360, mb: actionLabel ? 3 : 0 }}
      >
        {description}
      </Typography>
      {actionLabel && actionTo && (
        <Button component={RouterLink} to={actionTo} variant="contained">
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
