import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { CohortRow } from "@/types/api";
import { tokens } from "@/theme/theme";

interface RetentionTableProps {
  cohorts: CohortRow[];
}

function cellStyle(value: number | null) {
  if (value === null) {
    return { color: "text.secondary" };
  }
  // 0 -> transparent, 1 -> full data-teal, interpolated as background alpha.
  const alpha = Math.min(0.85, Math.max(0.08, value));
  return {
    bgcolor: `rgba(63, 167, 150, ${alpha})`,
    color: alpha > 0.45 ? "#FFFFFF" : tokens.graphite,
    fontWeight: 600,
  };
}

function formatPct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export default function RetentionTable({ cohorts }: RetentionTableProps) {
  if (cohorts.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No cohort data available yet.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            >
              Cohort week
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            >
              Size
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            >
              Day 1
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            >
              Day 7
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}
            >
              Day 30
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts.map((row) => (
            <TableRow key={row.cohort_week}>
              <TableCell
                sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13 }}
              >
                {row.cohort_week}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13 }}
              >
                {row.cohort_size.toLocaleString()}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: 13, ...cellStyle(row.day1_retention) }}
              >
                {formatPct(row.day1_retention)}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: 13, ...cellStyle(row.day7_retention) }}
              >
                {formatPct(row.day7_retention)}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: 13, ...cellStyle(row.day30_retention) }}
              >
                {formatPct(row.day30_retention)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
