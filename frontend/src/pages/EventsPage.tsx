import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, Stack, TextField } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { exportEventsCsv, getEvents, type EventsQuery } from "@/api/endpoints";
import { getApiErrorMessage } from "@/api/client";
import type { EventRow } from "@/types/api";
import { useDatasets } from "@/contexts/DatasetContext";

import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";

const columns: GridColDef<EventRow>[] = [
  { field: "timestamp", headerName: "Timestamp", flex: 1.2, minWidth: 170 },
  { field: "event_name", headerName: "Event", flex: 1, minWidth: 150 },
  { field: "feature_category", headerName: "Feature", flex: 1, minWidth: 130 },
  { field: "user_id", headerName: "User", flex: 0.9, minWidth: 120 },
  { field: "session_id", headerName: "Session", flex: 0.9, minWidth: 120 },
  { field: "device_type", headerName: "Device", flex: 0.7, minWidth: 100 },
  { field: "browser", headerName: "Browser", flex: 0.7, minWidth: 100 },
  { field: "os", headerName: "OS", flex: 0.7, minWidth: 100 },
];

export default function EventsPage() {
  const { selectedDataset, isLoading: datasetsLoading } = useDatasets();

  const [rows, setRows] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    event_name: "",
    feature_category: "",
    device_type: "",
  });

  const buildQuery = (): EventsQuery => ({
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
    ...(filters.event_name && { event_name: filters.event_name }),
    ...(filters.feature_category && {
      feature_category: filters.feature_category,
    }),
    ...(filters.device_type && { device_type: filters.device_type }),
  });

  useEffect(() => {
    if (!selectedDataset) {
      setRows([]);
      setTotal(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEvents(selectedDataset.id, buildQuery())
      .then((res) => {
        if (cancelled) return;
        setRows(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          getApiErrorMessage(err, "Couldn't load events for this dataset."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataset, paginationModel, filters]);

  const handleExport = async () => {
    if (!selectedDataset) return;
    setExporting(true);
    try {
      await exportEventsCsv(selectedDataset.id, buildQuery());
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't export events to CSV."));
    } finally {
      setExporting(false);
    }
  };

  if (!datasetsLoading && !selectedDataset) {
    return (
      <EmptyState
        title="No dataset selected"
        description="Upload a dataset to search and export raw event rows."
        actionLabel="Upload a dataset"
        actionTo="/datasets"
      />
    );
  }

  return (
    <Box>
      <SectionHeader
        title="Event explorer"
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadOutlinedIcon fontSize="small" />}
            onClick={handleExport}
            disabled={exporting || !selectedDataset}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />

      <Card sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <TextField
            size="small"
            label="Event name"
            value={filters.event_name}
            onChange={(e) => {
              setFilters((f) => ({ ...f, event_name: e.target.value }));
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
            fullWidth
          />
          <TextField
            size="small"
            label="Feature category"
            value={filters.feature_category}
            onChange={(e) => {
              setFilters((f) => ({ ...f, feature_category: e.target.value }));
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
            fullWidth
          />
          <TextField
            size="small"
            label="Device type"
            value={filters.device_type}
            onChange={(e) => {
              setFilters((f) => ({ ...f, device_type: e.target.value }));
              setPaginationModel((p) => ({ ...p, page: 0 }));
            }}
            fullWidth
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            rowCount={total}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            density="compact"
            sx={{
              border: "none",
              fontSize: 13,
              "--DataGrid-containerBackground": "transparent",
            }}
          />
        </Box>
      </Card>
    </Box>
  );
}
