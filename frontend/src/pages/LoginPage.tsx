import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PulseTrace from "@/components/PulseTrace";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { tokens } from "@/theme/theme";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Couldn't sign you in. Check your email and password.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.inkTeal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card sx={{ width: 400, p: 4, border: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <PulseTrace variant="wordmark" width={28} />
          <Typography variant="h5">FeaturePulse</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to read the signal in your feature data.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              fullWidth
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}
        >
          New here?{" "}
          <MuiLink component={RouterLink} to="/register">
            Create an account
          </MuiLink>
        </Typography>
      </Card>
    </Box>
  );
}
