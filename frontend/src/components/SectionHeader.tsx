import { Box, Typography } from "@mui/material";
import PulseTrace from "@/components/PulseTrace";
import { tokens } from "@/theme/theme";

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ color: tokens.graphite }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ mt: 1, opacity: 0.55 }}>
        <PulseTrace variant="divider" width="100%" color={tokens.signalAmber} />
      </Box>
    </Box>
  );
}
