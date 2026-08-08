import { createTheme } from "@mui/material/styles";

// ---------------------------------------------------------------------------
// FeaturePulse token system
// FeaturePulse is instrumentation for reading a signal out of noisy
// behavioral data. The palette and type system read like an instrument
// panel, not a marketing site: dark chrome, a paper canvas, and one
// amber "pulse trace" that stands in for the product's own name.
// ---------------------------------------------------------------------------

export const tokens = {
  inkTeal: "#10282B",
  inkTealLight: "#163539",
  paper: "#EEF2F0",
  graphite: "#1B2422",
  signalAmber: "#F2A93B",
  dataTeal: "#3FA796",
  alertCoral: "#E8604C",
  border: "rgba(27, 36, 34, 0.12)",
  borderOnDark: "rgba(238, 242, 240, 0.14)",
};

export const fontFamilies = {
  display: '"Space Grotesk", "Helvetica Neue", sans-serif',
  body: '"Inter", "Helvetica Neue", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
};

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: tokens.paper,
      paper: "#FFFFFF",
    },
    text: {
      primary: tokens.graphite,
      secondary: "rgba(27, 36, 34, 0.64)",
    },
    primary: {
      main: tokens.signalAmber,
      contrastText: tokens.inkTeal,
    },
    secondary: {
      main: tokens.dataTeal,
      contrastText: "#FFFFFF",
    },
    error: {
      main: tokens.alertCoral,
    },
    divider: tokens.border,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: fontFamilies.body,
    h1: { fontFamily: fontFamilies.display, fontWeight: 600, letterSpacing: "-0.01em" },
    h2: { fontFamily: fontFamilies.display, fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontFamily: fontFamilies.display, fontWeight: 600 },
    h4: { fontFamily: fontFamilies.display, fontWeight: 600 },
    h5: { fontFamily: fontFamilies.display, fontWeight: 600 },
    h6: { fontFamily: fontFamilies.display, fontWeight: 600 },
    button: { fontFamily: fontFamilies.body, fontWeight: 600, textTransform: "none" },
    overline: {
      fontFamily: fontFamilies.mono,
      letterSpacing: "0.08em",
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.paper,
        },
        "::selection": {
          backgroundColor: tokens.signalAmber,
          color: tokens.inkTeal,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "#DE9528",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          borderRadius: 10,
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.inkTeal,
          backgroundImage: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.inkTeal,
          color: tokens.paper,
          borderRight: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: fontFamilies.mono,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
