import { useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import { chatWithAi, generateSummary } from "@/api/endpoints";
import { getApiErrorMessage } from "@/api/client";
import type { ChatMessage } from "@/types/api";
import PulseTrace from "@/components/PulseTrace";
import { tokens } from "@/theme/theme";

interface AiInsightsPanelProps {
  datasetId: number;
}

export default function AiInsightsPanel({ datasetId }: AiInsightsPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await generateSummary(datasetId);
      setSummary(res.summary);
    } catch (err) {
      setSummaryError(
        getApiErrorMessage(
          err,
          "Couldn't reach the AI provider. Check your backend's AI_PROVIDER config.",
        ),
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSendChat = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const history = messages;
    const nextMessages: ChatMessage[] = [
      ...history,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await chatWithAi(datasetId, trimmed, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (err) {
      setChatError(
        getApiErrorMessage(
          err,
          "The AI provider didn't respond. Try again in a moment.",
        ),
      );
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Card sx={{ p: 0, overflow: "hidden" }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeOutlinedIcon
              fontSize="small"
              sx={{ color: tokens.signalAmber }}
            />
            <Typography variant="subtitle1">Executive summary</Typography>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
          >
            {summaryLoading
              ? "Generating…"
              : summary
                ? "Regenerate"
                : "Generate"}
          </Button>
        </Stack>

        {summaryLoading && (
          <Box sx={{ py: 2 }}>
            <PulseTrace variant="loading" width={120} />
          </Box>
        )}
        {summaryError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {summaryError}
          </Alert>
        )}
        {!summaryLoading && summary && (
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-line", color: "text.primary" }}
          >
            {summary}
          </Typography>
        )}
        {!summaryLoading && !summary && !summaryError && (
          <Typography variant="body2" color="text.secondary">
            Ask the model to read this dataset's KPIs and top features and write
            a short brief.
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2.5, pt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Ask about this dataset
        </Typography>

        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 260,
            overflowY: "auto",
            mb: 1.5,
            pr: messages.length ? 0.5 : 0,
          }}
        >
          {messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              e.g. "Which feature has the highest drop-off?" or "Summarize
              retention this week."
            </Typography>
          )}
          <Stack spacing={1}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  bgcolor: m.role === "user" ? tokens.inkTeal : tokens.paper,
                  color: m.role === "user" ? tokens.paper : tokens.graphite,
                  border:
                    m.role === "assistant"
                      ? `1px solid ${tokens.border}`
                      : "none",
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  maxWidth: "85%",
                  ml: m.role === "user" ? "auto" : 0,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {m.content}
                </Typography>
              </Box>
            ))}
            {chatLoading && (
              <Box sx={{ alignSelf: "flex-start", py: 0.5 }}>
                <PulseTrace variant="loading" width={80} />
              </Box>
            )}
          </Stack>
        </Box>

        {chatError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {chatError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSendChat}
          sx={{ display: "flex", gap: 1 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Ask a question about this data…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={chatLoading || !chatInput.trim()}
            sx={{ minWidth: 44, px: 1.5 }}
          >
            <SendOutlinedIcon fontSize="small" />
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
