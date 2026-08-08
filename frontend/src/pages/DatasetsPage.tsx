import { useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import { deleteDataset, uploadDataset } from "@/api/endpoints";
import { getApiErrorMessage } from "@/api/client";
import { useDatasets } from "@/contexts/DatasetContext";

import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import PulseTrace from "@/components/PulseTrace";
import { tokens } from "@/theme/theme";

export default function DatasetsPage() {
  const { datasets, selectedDataset, selectDataset, refresh, isLoading } =
    useDatasets();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPendingFile(file);
    setUploadResult(null);
    setUploadError(null);
    if (file && !name) setName(file.name.replace(/\.csv$/i, ""));
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const res = await uploadDataset(pendingFile, name || undefined);
      setUploadResult(
        `Ingested ${res.rows_ingested.toLocaleString()} of ${res.total_rows_in_file.toLocaleString()} rows` +
          (res.rows_dropped > 0
            ? ` (${res.rows_dropped.toLocaleString()} dropped as invalid).`
            : "."),
      );
      setPendingFile(null);
      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refresh();
      selectDataset(res.dataset);
    } catch (err) {
      setUploadError(
        getApiErrorMessage(
          err,
          "Couldn't upload this file. Check the CSV format and try again.",
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (datasetId: number) => {
    setDeletingId(datasetId);
    try {
      await deleteDataset(datasetId);
      await refresh();
    } catch (err) {
      setUploadError(getApiErrorMessage(err, "Couldn't delete this dataset."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <SectionHeader title="Upload a dataset" />
        <Card sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV of user interaction events (user_id, event_name,
            session_id, timestamp, and optional feature_category / device_type /
            browser / os columns).
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
          >
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadOutlinedIcon fontSize="small" />}
              sx={{ whiteSpace: "nowrap" }}
            >
              Choose file
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {pendingFile && (
              <Chip
                label={pendingFile.name}
                onDelete={() => {
                  setPendingFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                sx={{ bgcolor: tokens.paper }}
              />
            )}
            <TextField
              size="small"
              label="Dataset name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!pendingFile || uploading}
              sx={{ whiteSpace: "nowrap" }}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </Stack>

          {uploading && (
            <Box sx={{ py: 2 }}>
              <PulseTrace variant="loading" width={120} />
            </Box>
          )}
          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
          {uploadResult && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {uploadResult}
            </Alert>
          )}
        </Card>
      </Box>

      <Box>
        <SectionHeader title="Your datasets" />
        {!isLoading && datasets.length === 0 ? (
          <EmptyState
            title="No datasets yet"
            description="Upload your first CSV above to start seeing KPIs, funnels, and retention."
          />
        ) : (
          <Stack spacing={1.5}>
            {datasets.map((d) => {
              const isSelected = selectedDataset?.id === d.id;
              return (
                <Card
                  key={d.id}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    border: isSelected
                      ? `1px solid ${tokens.signalAmber}`
                      : undefined,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{d.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {d.row_count.toLocaleString()} rows · uploaded{" "}
                      {new Date(d.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {isSelected ? (
                    <Chip
                      icon={<CheckCircleOutlinedIcon fontSize="small" />}
                      label="Active"
                      size="small"
                      sx={{ bgcolor: tokens.dataTeal, color: "#fff" }}
                    />
                  ) : (
                    <Button size="small" onClick={() => selectDataset(d)}>
                      Set active
                    </Button>
                  )}

                  <IconButton
                    size="small"
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                    aria-label={`Delete ${d.name}`}
                  >
                    <DeleteOutlineOutlinedIcon
                      fontSize="small"
                      sx={{ color: tokens.alertCoral }}
                    />
                  </IconButton>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
