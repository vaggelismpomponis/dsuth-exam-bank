import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  Toolbar,
  Box,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Divider,
  Typography,
  Avatar,
  Tooltip,
  Chip,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { supabase } from "../../supabaseClient";
import { AdminSidebarContext } from "../../context/AdminSidebarContext";

const DRAWER_WIDTH = 272;
const COLLAPSED_WIDTH = 72;
const NAV_HEIGHT_XS = "56px";
const NAV_HEIGHT_SM = "64px";

const adminMenu = [
  {
    text: "Διαχείριση Αρχείων",
    icon: <FolderOpenIcon />,
    path: "/admin/files",
    description: "Αρχεία & εξετάσεις",
  },
  {
    text: "Διαχείριση Χρηστών",
    icon: <PeopleAltIcon />,
    path: "/admin/users",
    description: "Χρήστες & ρόλοι",
  },
  {
    text: "Διαχείριση Μαθημάτων",
    icon: <MenuBookIcon />,
    path: "/admin/courses",
    description: "Μαθήματα & εξάμηνα",
  },
  {
    text: "Μαζικό Upload",
    icon: <CloudUploadIcon />,
    path: "/admin/upload",
    description: "Μαζική μεταφόρτωση",
  },
  {
    text: "Αιτήματα Αρχείων",
    icon: <HelpOutlineIcon />,
    path: "/admin/requests",
    description: "Αιτήματα χρηστών",
  },
  {
    text: "Αιτήσεις Admin",
    icon: <AssignmentIndIcon />,
    path: "/admin/applications",
    description: "Αιτήσεις για admin",
  },
];

const metricCards = [
  {
    key: "users",
    label: "Συνολικοί Χρήστες",
    icon: <PeopleIcon />,
    color: "#1a73e8",
    bg: "linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%)",
    darkBg: "linear-gradient(135deg, rgba(26,115,232,0.18) 0%, rgba(26,115,232,0.08) 100%)",
    path: "/admin/users",
  },
  {
    key: "pendingFiles",
    label: "Εκκρεμή Αρχεία",
    icon: <HourglassTopIcon />,
    color: "#f57c00",
    bg: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    darkBg: "linear-gradient(135deg, rgba(245,124,0,0.18) 0%, rgba(245,124,0,0.08) 100%)",
    path: "/admin/files",
  },
  {
    key: "openRequests",
    label: "Ανοιχτά Αιτήματα",
    icon: <MarkEmailUnreadIcon />,
    color: "#d32f2f",
    bg: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
    darkBg: "linear-gradient(135deg, rgba(211,47,47,0.18) 0%, rgba(211,47,47,0.08) 100%)",
    path: "/admin/requests",
  },
  {
    key: "adminApps",
    label: "Αιτήσεις Admin",
    icon: <AdminPanelSettingsIcon />,
    color: "#7b1fa2",
    bg: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    darkBg: "linear-gradient(135deg, rgba(123,31,162,0.18) 0%, rgba(123,31,162,0.08) 100%)",
    path: "/admin/applications",
  },
];

const NavItem = ({ item, isActive, collapsed, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Tooltip title={collapsed ? item.text : ""} placement="right" arrow>
      <ListItemButton
        selected={isActive}
        onClick={onClick}
        sx={{
          mx: 1,
          mb: 0.5,
          borderRadius: "12px",
          px: collapsed ? 1.5 : 2,
          py: 1.2,
          minHeight: 48,
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden",
          background: isActive
            ? isDark
              ? alpha("#1a73e8", 0.2)
              : alpha("#1a73e8", 0.1)
            : "transparent",
          "&:hover": {
            background: isActive
              ? isDark
                ? alpha("#1a73e8", 0.25)
                : alpha("#1a73e8", 0.14)
              : isDark
              ? alpha("#fff", 0.06)
              : alpha("#000", 0.04),
          },
          "&.Mui-selected": {
            background: isDark
              ? alpha("#1a73e8", 0.2)
              : alpha("#1a73e8", 0.1),
            "&:hover": {
              background: isDark
                ? alpha("#1a73e8", 0.28)
                : alpha("#1a73e8", 0.16),
            },
          },
        }}
      >
        {/* Active indicator */}
        {isActive && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: "60%",
              borderRadius: "0 3px 3px 0",
              bgcolor: "#1a73e8",
            }}
          />
        )}
        <Box
          sx={{
            color: isActive ? "#1a73e8" : "text.secondary",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            transition: "color 0.2s",
            "& svg": { fontSize: 21 },
          }}
        >
          {item.icon}
        </Box>
        {!collapsed && (
          <Box sx={{ ml: 1.5, minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "primary.main" : "text.primary",
                lineHeight: 1.3,
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.72rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              {item.description}
            </Typography>
          </Box>
        )}
      </ListItemButton>
    </Tooltip>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    users: null,
    pendingFiles: null,
    openRequests: null,
    adminApps: null,
  });
  const [metricsLoading, setMetricsLoading] = useState(false);

  const isRoot = location.pathname === "/admin";
  const collapsed = !drawerOpen && !isMobile;

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen((p) => !p);
    else setDrawerOpen((p) => !p);
  };

  useEffect(() => {
    if (!isRoot) return;
    setMetricsLoading(true);
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("exams").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("file_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("admin_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([users, pendingFiles, openRequests, adminApps]) => {
      setMetrics({
        users: users.count ?? 0,
        pendingFiles: pendingFiles.count ?? 0,
        openRequests: openRequests.count ?? 0,
        adminApps: adminApps.count ?? 0,
      });
      setMetricsLoading(false);
    });
  }, [location.pathname]);

  const sidebarContent = (mobile = false) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark
          ? "linear-gradient(180deg, #1a1b1e 0%, #16171a 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8fafd 100%)",
        borderRight: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: collapsed && !mobile ? 1 : 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !mobile ? "center" : "space-between",
          borderBottom: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          minHeight: 64,
        }}
      >
        {(!collapsed || mobile) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(26,115,232,0.4)",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.78rem", letterSpacing: "-0.5px" }}>
                DS
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "text.primary", lineHeight: 1.2 }}>
                Admin Panel
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", lineHeight: 1 }}>
                DSUth Exam Bank
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && !mobile && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.78rem" }}>DS</Typography>
          </Box>
        )}
        {mobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: "text.secondary" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1.5 }}>
        {/* Back to site */}
        <Box sx={{ px: 1, mb: 0.5 }}>
          <Tooltip title={collapsed && !mobile ? "Επιστροφή στο site" : ""} placement="right">
            <ListItemButton
              onClick={() => { navigate("/"); if (mobile) setMobileOpen(false); }}
              sx={{
                borderRadius: "12px",
                px: collapsed && !mobile ? 1.5 : 2,
                py: 1,
                minHeight: 40,
                justifyContent: collapsed && !mobile ? "center" : "flex-start",
                "&:hover": { background: isDark ? alpha("#fff", 0.06) : alpha("#000", 0.04) },
              }}
            >
              <HomeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              {(!collapsed || mobile) && (
                <Typography variant="caption" sx={{ ml: 1.5, fontWeight: 500, color: "text.secondary", fontSize: "0.8rem" }}>
                  ← Επιστροφή στο site
                </Typography>
              )}
            </ListItemButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mx: 2, mb: 1.5, opacity: 0.5 }} />

        {/* Dashboard link */}
        <Box sx={{ px: collapsed && !mobile ? 0 : 0, mb: 0.5 }}>
          <NavItem
            item={{ text: "Dashboard", icon: <DashboardIcon />, path: "/admin", description: "Στατιστικά & επισκόπηση" }}
            isActive={isRoot}
            collapsed={collapsed && !mobile}
            onClick={() => { navigate("/admin"); if (mobile) setMobileOpen(false); }}
          />
        </Box>

        {/* Section label */}
        {(!collapsed || mobile) && (
          <Typography
            sx={{
              px: 3,
              py: 0.75,
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "text.secondary",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Διαχείριση
          </Typography>
        )}

        {adminMenu.map((item) => (
          <NavItem
            key={item.text}
            item={item}
            isActive={location.pathname === item.path}
            collapsed={collapsed && !mobile}
            onClick={() => { navigate(item.path); if (mobile) setMobileOpen(false); }}
          />
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderTop: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        }}
      >
        {(!collapsed || mobile) && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              background: isDark ? alpha("#1a73e8", 0.12) : alpha("#1a73e8", 0.07),
              border: "1px solid",
              borderColor: isDark ? alpha("#1a73e8", 0.2) : alpha("#1a73e8", 0.12),
            }}
          >
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "primary.main", mb: 0.2 }}>
              🛡️ Admin Mode Active
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", lineHeight: 1.3 }}>
              Έχεις πλήρη πρόσβαση στο σύστημα
            </Typography>
          </Box>
        )}
        {collapsed && !mobile && (
          <Tooltip title="Admin Mode" placement="right">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: isDark ? alpha("#1a73e8", 0.15) : alpha("#1a73e8", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                cursor: "default",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 18, color: "primary.main" }} />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <AdminSidebarContext.Provider value={{ onToggle: handleDrawerToggle }}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: isDark ? "#111214" : "#f1f4f9",
          overflowX: "hidden",
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open={drawerOpen}
            sx={{
              width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
              flexShrink: 0,
              transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
              "& .MuiDrawer-paper": {
                width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
                boxSizing: "border-box",
                border: "none",
                overflowX: "hidden",
                position: "fixed",
                top: NAV_HEIGHT_SM,
                height: `calc(100vh - ${NAV_HEIGHT_SM})`,
                zIndex: 1100,
                transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isDark ? "4px 0 24px rgba(0,0,0,0.3)" : "4px 0 24px rgba(0,0,0,0.05)",
              },
            }}
          >
            {sidebarContent(false)}
          </Drawer>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                border: "none",
                boxShadow: "8px 0 32px rgba(0,0,0,0.2)",
                position: "fixed",
                top: NAV_HEIGHT_XS,
                height: `calc(100vh - ${NAV_HEIGHT_XS})`,
                zIndex: 1300,
              },
            }}
          >
            {sidebarContent(true)}
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: isMobile ? 0 : collapsed ? `${COLLAPSED_WIDTH}px` : `${DRAWER_WIDTH}px`,
            transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          }}
        >
          {/* Page Content */}
          <Box
            sx={{
              flex: 1,
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2.5, md: 3.5 },
            }}
          >
            {isRoot ? (
              /* ─── Dashboard Home ─── */
              <Box>
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(26,115,232,0.35)",
                      }}
                    >
                      <DashboardIcon sx={{ color: "#fff", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: "1.5rem", sm: "1.85rem" } }}
                      >
                        Dashboard
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.2 }}>
                        Επισκόπηση συστήματος &amp; στατιστικά
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Metric Cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: { xs: 2, sm: 2.5 },
                    mb: 4,
                  }}
                >
                  {metricCards.map((card) => (
                    <Box
                      key={card.key}
                      onClick={() => navigate(card.path)}
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: "20px",
                        background: isDark ? card.darkBg : card.bg,
                        border: "1px solid",
                        borderColor: isDark ? alpha(card.color, 0.15) : alpha(card.color, 0.2),
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 16px 40px ${alpha(card.color, 0.2)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: alpha(card.color, 0.08),
                        }}
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          background: alpha(card.color, 0.15),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1.5,
                          "& svg": { fontSize: 22, color: card.color },
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: card.color,
                          lineHeight: 1,
                          mb: 0.5,
                          fontSize: { xs: "1.8rem", sm: "2.2rem" },
                        }}
                      >
                        {metricsLoading ? "—" : metrics[card.key]}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.72rem", sm: "0.8rem" },
                          fontWeight: 600,
                          color: isDark ? alpha(card.color, 0.85) : alpha(card.color, 0.8),
                          lineHeight: 1.2,
                        }}
                      >
                        {card.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Quick Actions */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, fontSize: "1rem" }}>
                    Γρήγορες Ενέργειες
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {adminMenu.map((item) => (
                      <Box
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                          p: 2.5,
                          borderRadius: "16px",
                          background: isDark ? alpha("#fff", 0.04) : "#ffffff",
                          border: "1px solid",
                          borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.2s ease",
                          boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: isDark
                              ? `0 8px 24px rgba(0,0,0,0.3)`
                              : "0 8px 24px rgba(0,0,0,0.1)",
                            borderColor: "primary.main",
                            "& .arrow-icon": { opacity: 1, transform: "translateX(0)" },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            background: isDark ? alpha("#1a73e8", 0.15) : alpha("#1a73e8", 0.08),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            "& svg": { fontSize: 22, color: "primary.main" },
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.3 }}>
                            {item.text}
                          </Typography>
                          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.3 }}>
                            {item.description}
                          </Typography>
                        </Box>
                        <ChevronRightIcon
                          className="arrow-icon"
                          sx={{
                            fontSize: 18,
                            color: "text.secondary",
                            opacity: 0,
                            transform: "translateX(-4px)",
                            transition: "all 0.2s ease",
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              /* ─── Sub-pages ─── */
              <Box>
                {/* Back button */}
                <Button
                  startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "14px !important" }} />}
                  onClick={() => navigate("/admin")}
                  size="small"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "text.secondary",
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    py: 0.75,
                    background: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.04),
                    "&:hover": {
                      background: isDark ? alpha("#fff", 0.09) : alpha("#000", 0.07),
                      color: "text.primary",
                    },
                  }}
                >
                  Πίσω στο Dashboard
                </Button>
                <Outlet />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AdminSidebarContext.Provider>
  );
};

export default AdminDashboard;
