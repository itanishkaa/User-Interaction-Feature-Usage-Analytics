import { useState, type MouseEvent } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import PulseTrace from "@/components/PulseTrace";
import { useAuth } from "@/contexts/AuthContext";
import { useDatasets } from "@/contexts/DatasetContext";
import { tokens } from "@/theme/theme";

const DRAWER_WIDTH = 232;

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
  },
  {
    to: "/events",
    label: "Event explorer",
    icon: <TableRowsOutlinedIcon fontSize="small" />,
  },
  {
    to: "/datasets",
    label: "Datasets",
    icon: <CloudUploadOutlinedIcon fontSize="small" />,
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { datasets, selectedDataset, selectDataset } = useDatasets();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PulseTrace variant="wordmark" width={30} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                letterSpacing: "-0.01em",
                color: tokens.paper,
              }}
            >
              FeaturePulse
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 1.5, mt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === "/"}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: "rgba(238, 242, 240, 0.72)",
                "&.active": {
                  bgcolor: tokens.inkTealLight,
                  color: tokens.paper,
                },
                "&:hover": { bgcolor: tokens.inkTealLight },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                primary={item.label}
              />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", px: 2.5, py: 2.5 }}>
          <Box sx={{ opacity: 0.6, mb: 1.5 }}>
            <PulseTrace
              variant="divider"
              width="100%"
              color={tokens.borderOnDark}
            />
          </Box>
          <Typography
            variant="overline"
            sx={{ color: "rgba(238, 242, 240, 0.5)" }}
          >
            v0.4 · Phase 4
          </Typography>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ borderBottom: `1px solid ${tokens.borderOnDark}` }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: "rgba(238, 242, 240, 0.6)" }}
            >
              Dataset
            </Typography>
            <Select
              size="small"
              value={selectedDataset?.id ?? ""}
              displayEmpty
              onChange={(e) => {
                const next =
                  datasets.find((d) => d.id === Number(e.target.value)) ?? null;
                selectDataset(next);
              }}
              sx={{
                minWidth: 220,
                color: tokens.paper,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 13,
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(238, 242, 240, 0.24)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(238, 242, 240, 0.4)",
                },
                ".MuiSvgIcon-root": { color: tokens.paper },
              }}
            >
              {datasets.length === 0 && (
                <MenuItem value="" disabled>
                  No datasets uploaded yet
                </MenuItem>
              )}
              {datasets.map((d) => (
                <MenuItem
                  key={d.id}
                  value={d.id}
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 13,
                  }}
                >
                  {d.name} · {d.row_count.toLocaleString()} rows
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: tokens.signalAmber,
                  color: tokens.inkTeal,
                  fontSize: 14,
                }}
              >
                {(user?.email ?? "?").charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled sx={{ fontSize: 13, opacity: 0.8 }}>
                {user?.email}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            bgcolor: "background.default",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
