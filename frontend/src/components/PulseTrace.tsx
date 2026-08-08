import { Box, keyframes } from "@mui/material";
import { tokens } from "@/theme/theme";

type PulseTraceVariant = "wordmark" | "loading" | "divider";

interface PulseTraceProps {
  variant?: PulseTraceVariant;
  width?: number | string;
  color?: string;
}

const PATH_D = "M0 20 L26 20 L34 4 L46 36 L54 20 L80 20 L88 10 L96 20 L200 20";

const dash = keyframes`
  0% { stroke-dashoffset: 240; }
  100% { stroke-dashoffset: 0; }
`;

export default function PulseTrace({
  variant = "divider",
  width = 200,
  color,
}: PulseTraceProps) {
  const stroke =
    color ?? (variant === "loading" ? tokens.signalAmber : tokens.signalAmber);
  const animated = variant === "loading";

  return (
    <Box
      component="svg"
      viewBox="0 0 200 40"
      width={width}
      height={typeof width === "number" ? width / 5 : 40}
      sx={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <path
        d={PATH_D}
        fill="none"
        stroke={stroke}
        strokeWidth={variant === "divider" ? 1.5 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animated
            ? {
                strokeDasharray: 240,
                animation: `${dash} 1.1s linear infinite`,
              }
            : undefined
        }
      />
    </Box>
  );
}
