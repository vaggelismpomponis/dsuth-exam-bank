import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, ListItemButton, Divider, Typography, Avatar,
  Tooltip, Chip, IconButton, Button, useTheme, useMediaQuery, alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  FolderOpen as FolderOpenIcon,
  Users as PeopleAltIcon,
  Home as HomeIcon,
  BookOpen as MenuBookIcon,
  UploadCloud as CloudUploadIcon,
  HelpCircle as HelpOutlineIcon,
  UserCheck as AssignmentIndIcon,
  LayoutDashboard as DashboardIcon,
  Users as PeopleIcon,
  Clock as HourglassTopIcon,
  Mail as MarkEmailUnreadIcon,
  ShieldCheck as AdminPanelSettingsIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  BarChart2 as BarChartIcon,
} from "lucide-react";

import { supabase } from "../../supabaseClient";
import { AdminSidebarContext } from "../../context/AdminSidebarContext";

/* ─── Constants ─────────────────────────────────── */
const DRAWER_W = 256;
const COLLAPSE_W = 64;
const NAV_H = 64;   // must match NavBar height on md+
const NAV_H_XS = 56;

/* ─── Navigation menu ───────────────────────────── */
const adminMenu = [
  { text: "Στατιστικά", sub: "Στατιστικά & Analytics", icon: <BarChartIcon size={20} />, path: "/admin/analytics" },
  { text: "Αρχεία", sub: "Αρχεία & εξετάσεις", icon: <FolderOpenIcon size={20} />, path: "/admin/files" },
  { text: "Χρήστες", sub: "Χρήστες & ρόλοι", icon: <PeopleAltIcon size={20} />, path: "/admin/users" },
  { text: "Μαθήματα", sub: "Μαθήματα & εξάμηνα", icon: <MenuBookIcon size={20} />, path: "/admin/courses" },
  { text: "Ανέβασμα Αρχείων", sub: "Μαζική μεταφόρτωση", icon: <CloudUploadIcon size={20} />, path: "/admin/upload" },
  { text: "Αιτήματα", sub: "Αιτήματα χρηστών", icon: <HelpOutlineIcon size={20} />, path: "/admin/requests" },
  { text: "Αιτήσεις για admin", sub: "Αιτήσεις για admin", icon: <AssignmentIndIcon size={20} />, path: "/admin/applications" },
];

/* ─── Metric card definitions ───────────────────── */
const METRICS = [
  { key: "users", label: "Χρήστες", icon: <PeopleIcon size={22} />, color: "#1a73e8", path: "/admin/users" },
  { key: "pendingFiles", label: "Εκκρεμή Αρχεία", icon: <HourglassTopIcon size={22} />, color: "#f57c00", path: "/admin/files" },
  { key: "openRequests", label: "Ανοιχτά Αιτήματα", icon: <MarkEmailUnreadIcon size={22} />, color: "#d32f2f", path: "/admin/requests" },
  { key: "adminApps", label: "Αιτήσεις Admin", icon: <AdminPanelSettingsIcon size={22} />, color: "#7b1fa2", path: "/admin/applications" },
];

/* ─── NavItem ────────────────────────────────────── */
const NavItem = ({ item, active, mini, onClick }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === "dark";

  return (
    <Tooltip title={mini ? item.text : ""} placement="right" arrow disableInteractive>
      <ListItemButton
        selected={active}
        onClick={onClick}
        sx={{
          mx: 1, mb: 0.5,
          borderRadius: "10px",
          px: mini ? 0 : 1.75, py: 1.1,
          minHeight: 46,
          justifyContent: mini ? "center" : "flex-start",
          transition: "all 0.18s ease",
          position: "relative",
          gap: mini ? 0 : 1.5,
          background: active
            ? dark ? alpha("#1a73e8", 0.18) : alpha("#1a73e8", 0.1)
            : "transparent",
          "&:hover": {
            background: active
              ? dark ? alpha("#1a73e8", 0.24) : alpha("#1a73e8", 0.15)
              : dark ? alpha("#fff", 0.06) : alpha("#000", 0.04),
          },
          "&.Mui-selected": { background: "transparent" },
        }}
      >
        {/* active pill */}
        {active && (
          <Box sx={{
            position: "absolute", left: 0, top: "50%",
            transform: "translateY(-50%)",
            width: 3, height: "55%",
            borderRadius: "0 3px 3px 0",
            bgcolor: "#1a73e8",
          }} />
        )}

        {/* icon */}
        <Box sx={{
          color: active ? "#1a73e8" : "text.secondary",
          display: "flex", alignItems: "center",
          minWidth: mini ? "auto" : 22,
          "& svg": { fontSize: 20 },
          transition: "color 0.18s",
        }}>
          {item.icon}
        </Box>

        {/* label */}
        {!mini && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontWeight: active ? 700 : 500,
              color: active ? "primary.main" : "text.primary",
              fontSize: "0.855rem", lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {item.text}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", lineHeight: 1.2 }}>
              {item.sub}
            </Typography>
          </Box>
        )}
      </ListItemButton>
    </Tooltip>
  );
};

/* ─── Sidebar content ────────────────────────────── */
const Sidebar = ({ mini, mobile, location, navigate, onClose, onToggle }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const isRoot = location.pathname === "/admin";

  return (
    <Box sx={{
      height: "100%", display: "flex", flexDirection: "column",
      bgcolor: "background.paper",
      borderRight: "1px solid",
      borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    }}>

      {/* ── Brand header ── */}
      <Box sx={{
        px: mini && !mobile ? 0 : 2.5, py: 0,
        height: NAV_H,
        display: "flex", alignItems: "center",
        justifyContent: mini && !mobile ? "center" : "space-between",
        borderBottom: "1px solid",
        borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}>
        {(!mini || mobile) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "6px",
              bgcolor: "primary.main",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "-0.5px" }}>
                DS
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.875rem", lineHeight: 1.2, color: "text.primary" }}>
                Admin Panel
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                DSUth Exam Bank
              </Typography>
            </Box>
          </Box>
        )}
        {mini && !mobile && (
          <Box sx={{
            width: 32, height: 32, borderRadius: "6px",
            bgcolor: "primary.main",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.75rem" }}>DS</Typography>
          </Box>
        )}
        {mobile && (
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseIcon size={18} />
          </IconButton>
        )}
      </Box>

      {/* ── Nav ── */}
      <Box sx={{
        flex: 1, overflowY: "auto", overflowX: "hidden", py: 1.5,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { background: alpha("#888", 0.25), borderRadius: 4 },
      }}>
        {/* Back to site */}
        <Box sx={{ px: 1, mb: 0.5 }}>
          <Tooltip title={mini && !mobile ? "← Site" : ""} placement="right" disableInteractive>
            <ListItemButton
              onClick={() => { navigate("/"); if (mobile) onClose(); }}
              sx={{
                borderRadius: "10px", minHeight: 38,
                px: mini && !mobile ? 0 : 1.75, py: 0.8,
                justifyContent: mini && !mobile ? "center" : "flex-start",
                gap: mini && !mobile ? 0 : 1.5,
                "&:hover": { background: dark ? alpha("#fff", 0.06) : alpha("#000", 0.04) },
              }}
            >
              <HomeIcon size={18} style={{ color: 'var(--mui-palette-text-secondary, #888)' }} />
              {(!mini || mobile) && (
                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontWeight: 500 }}>
                  ← Επιστροφή στο site
                </Typography>
              )}
            </ListItemButton>
          </Tooltip>
        </Box>

        <Divider sx={{ mx: 2, mb: 1.5, opacity: 0.45 }} />

        {/* Dashboard */}
        <NavItem
          item={{ text: "Dashboard", sub: "Επισκόπηση", icon: <DashboardIcon size={20} /> }}
          active={isRoot}
          mini={mini && !mobile}
          onClick={() => { navigate("/admin"); if (mobile) onClose(); }}
        />

        {(!mini || mobile) && (
          <Typography sx={{
            px: 2.75, pt: 1.5, pb: 0.75,
            fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.1em", color: "text.secondary",
            textTransform: "uppercase", opacity: 0.65,
          }}>
            Διαχείριση
          </Typography>
        )}

        {mini && !mobile && <Divider sx={{ mx: 1.5, my: 1, opacity: 0.35 }} />}

        {adminMenu.map(item => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            mini={mini && !mobile}
            onClick={() => { navigate(item.path); if (mobile) onClose(); }}
          />
        ))}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{
        px: mini && !mobile ? 1 : 2, py: 1.75,
        borderTop: "1px solid",
        borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      }}>
        {(!mini || mobile) ? (
          <Box sx={{
            p: 1.5, borderRadius: "10px",
            background: dark ? alpha("#1a73e8", 0.12) : alpha("#1a73e8", 0.07),
            border: "1px solid",
            borderColor: dark ? alpha("#1a73e8", 0.2) : alpha("#1a73e8", 0.12),
          }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "primary.main", mb: 0.2 }}>
              🛡️ Admin Mode Active
            </Typography>
            <Typography sx={{ fontSize: "0.64rem", color: "text.secondary", lineHeight: 1.35 }}>
              Πλήρης πρόσβαση στο σύστημα
            </Typography>
          </Box>
        ) : (
          <Tooltip title="Admin" placement="right" disableInteractive>
            <Box sx={{
              width: 36, height: 36, borderRadius: "10px", mx: "auto",
              background: dark ? alpha("#1a73e8", 0.15) : alpha("#1a73e8", 0.1),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AdminPanelSettingsIcon size={18} color="var(--mui-palette-primary-main, #1a73e8)" />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

/* ─── MetricCard ─────────────────────────────────── */
const MetricCard = ({ card, value, loading, onClick }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === "dark";
  const c = card.color;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: "12px",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      {/* Icon */}
      <Box sx={{
        mb: 1.5,
        color: "primary.main",
        "& svg": { fontSize: 22 },
      }}>
        {card.icon}
      </Box>

      {/* Number */}
      <Typography sx={{
        fontWeight: 800, color: "text.primary", lineHeight: 1, mb: 0.5,
        fontSize: { xs: "1.85rem", sm: "2.25rem" },
      }}>
        {loading ? "—" : value ?? 0}
      </Typography>

      {/* Label */}
      <Typography sx={{
        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
        fontWeight: 600, lineHeight: 1.2,
        color: "text.secondary",
      }}>
        {card.label}
      </Typography>
    </Box>
  );
};

/* ─── Main Component ─────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dark = theme.palette.mode === "dark";

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [metricsLoad, setMetricsLoad] = useState(true);

  const isRoot = location.pathname === "/admin";
  const mini = !drawerOpen && !isMobile;          // collapsed desktop mode

  /* Toggle sidebar */
  const handleToggle = () => {
    if (isMobile) setMobileOpen(p => !p);
    else setDrawerOpen(p => !p);
  };

  /* Fetch metrics only on dashboard root */
  useEffect(() => {
    if (!isRoot) return;
    setMetricsLoad(true);
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("exams").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("file_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("admin_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([u, pf, or, aa]) => {
      setMetrics({ users: u.count, pendingFiles: pf.count, openRequests: or.count, adminApps: aa.count });
      setMetricsLoad(false);
    });
  }, [location.pathname]);

  /* breadcrumb label */
  const crumbLabel = adminMenu.find(m => m.path === location.pathname)?.text;

  const drawerProps = {
    mini, mobile: false,
    location, navigate,
    onClose: () => setMobileOpen(false),
    onToggle: handleToggle,
  };

  return (
    <AdminSidebarContext.Provider value={{ onToggle: handleToggle }}>
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", maxWidth: "100vw", bgcolor: dark ? "#111214" : "#f1f3f8", overflowX: "hidden" }}>

        {/* ── Desktop Sidebar ── */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: mini ? COLLAPSE_W : DRAWER_W,
            flexShrink: 0,
            transition: "width 0.28s cubic-bezier(.4,0,.2,1)",
            "& .MuiDrawer-paper": {
              display: { xs: "none", md: "block" },
              width: mini ? COLLAPSE_W : DRAWER_W,
              border: "none",
              overflowX: "hidden",
              top: NAV_H,
              height: `calc(100vh - ${NAV_H}px)`,
              zIndex: 1100,
              transition: "width 0.28s cubic-bezier(.4,0,.2,1)",
              boxShadow: dark ? "4px 0 20px rgba(0,0,0,.3)" : "4px 0 20px rgba(0,0,0,.04)",
            },
          }}
        >
          <Sidebar {...drawerProps} />
        </Drawer>

        {/* ── Mobile Sidebar ── */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: false }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_W,
              border: "none",
              borderRadius: 0,
              boxShadow: "8px 0 32px rgba(0,0,0,.18)",
              top: 0,
              height: "100%",
              overflowX: "hidden",
              zIndex: 1300,
            },
          }}
        >
          <Sidebar {...drawerProps} mobile />
        </Drawer>

        {/* ── Main ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: "100%", md: `calc(100% - ${mini ? COLLAPSE_W : DRAWER_W}px)` },
            maxWidth: "100%",
            ml: 0,
            transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)",
            minHeight: "100vh",
            minWidth: 0,
            overflowX: "hidden",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* ── Top sub-bar ── */}
          <Box sx={{
            height: { xs: 48, sm: 52 },
            display: "flex", alignItems: "center",
            px: { xs: 2, md: 3 },
            borderBottom: "1px solid",
            borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
            bgcolor: dark ? alpha("#fff", 0.025) : "#fff",
            flexShrink: 0,
            gap: 0,
          }}>

            {/* Desktop: sidebar collapse toggle */}
            {!isMobile && (
              <>
                <Tooltip title={mini ? "Ανάπτυξη" : "Σύμπτυξη"} disableInteractive>
                  <IconButton
                    onClick={handleToggle}
                    size="small"
                    sx={{
                      width: 32, height: 32, borderRadius: "8px",
                      color: "text.secondary", mr: 1.5,
                      "&:hover": { bgcolor: dark ? alpha("#fff", 0.07) : alpha("#000", 0.05) },
                    }}
                  >
                    {mini ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Box sx={{ width: "1px", height: 20, bgcolor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", mr: 1.5, flexShrink: 0 }} />
              </>
            )}

            {/* Mobile: hamburger to open sidebar (always visible) + back arrow on sub-pages */}
            {isMobile && (
              <>
                <Tooltip title="Μενού" disableInteractive>
                  <IconButton
                    onClick={() => setMobileOpen(true)}
                    size="small"
                    sx={{
                      width: 32, height: 32, borderRadius: "8px",
                      color: "text.secondary", mr: 1,
                      "&:hover": { bgcolor: dark ? alpha("#fff", 0.07) : alpha("#000", 0.05) },
                    }}
                  >
                    <MenuIcon size={18} />
                  </IconButton>
                </Tooltip>
                {!isRoot && (
                  <Tooltip title="Πίσω στο Dashboard" disableInteractive>
                    <IconButton
                      onClick={() => navigate("/admin")}
                      size="small"
                      sx={{
                        width: 32, height: 32, borderRadius: "8px",
                        color: "text.secondary", mr: 1,
                        "&:hover": { bgcolor: dark ? alpha("#fff", 0.07) : alpha("#000", 0.05) },
                      }}
                    >
                      <ChevronLeftIcon size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                <Box sx={{ width: "1px", height: 20, bgcolor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", mr: 1.5, flexShrink: 0 }} />
              </>
            )}

            {/* Breadcrumb */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0, flex: 1 }}>
              <Typography
                onClick={isRoot ? undefined : () => navigate("/admin")}
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: isRoot ? 700 : 500,
                  color: isRoot ? "text.primary" : "text.secondary",
                  flexShrink: 0,
                  cursor: isRoot ? "default" : "pointer",
                  borderRadius: "6px",
                  px: isRoot ? 0 : 0.75,
                  py: isRoot ? 0 : 0.3,
                  transition: "all .15s",
                  "&:hover": isRoot ? {} : {
                    color: "text.primary",
                    bgcolor: dark ? alpha("#fff", 0.06) : alpha("#000", 0.05),
                  },
                }}
              >
                Admin
              </Typography>

              {!isRoot && (
                <>
                  <ChevronRightIcon size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
                  <Typography sx={{
                    fontSize: "0.8rem", fontWeight: 700,
                    color: "text.primary",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {crumbLabel ?? location.pathname.split("/").pop()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* ── Page content ── */}
          <Box sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            maxWidth: 1380,
            width: "100%",
            mx: "auto",
            overflowX: "hidden",
            minWidth: 0,
          }}>
            {isRoot ? (
              /* ─── Dashboard home ─── */
              <Box>
                {/* Page title */}
                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <DashboardIcon size={28} color="var(--mui-palette-primary-main, #1a73e8)" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: { xs: "1.45rem", sm: "1.8rem" } }}>
                      Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.15 }}>
                      Επισκόπηση συστήματος &amp; στατιστικά
                    </Typography>
                  </Box>
                </Box>

                {/* Metric cards */}
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
                  gap: { xs: 2, sm: 2.5 }, mb: 5,
                }}>
                  {METRICS.map(card => (
                    <MetricCard
                      key={card.key}
                      card={card}
                      value={metrics[card.key]}
                      loading={metricsLoad}
                      onClick={() => navigate(card.path)}
                    />
                  ))}
                </Box>

                {/* Quick actions */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, fontSize: "0.975rem", color: "text.secondary" }}>
                  ΓΡΗΓΟΡΕΣ ΕΝΕΡΓΕΙΕΣ
                </Typography>
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)" },
                  gap: 2,
                }}>
                  {adminMenu.map(item => (
                    <Box
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        p: 2.5, borderRadius: "16px",
                        background: dark ? alpha("#fff", 0.04) : "#fff",
                        border: "1px solid",
                        borderColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 2,
                        boxShadow: dark ? "none" : "0 2px 10px rgba(0,0,0,.04)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: dark ? "0 8px 24px rgba(0,0,0,.3)" : "0 8px 24px rgba(0,0,0,.1)",
                          borderColor: "primary.main",
                          "& .arr": { opacity: 1, transform: "translateX(0)" },
                        },
                      }}
                    >
                      <Box sx={{
                        width: 42, height: 42, borderRadius: "11px", flexShrink: 0,
                        background: dark ? alpha("#1a73e8", 0.15) : alpha("#1a73e8", 0.08),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        "& svg": { fontSize: 21, color: "primary.main" },
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.3 }}>
                          {item.text}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.25 }}>
                          {item.sub}
                        </Typography>
                      </Box>
                      <Box
                        className="arr"
                        sx={{
                          opacity: 0,
                          transform: "translateX(-5px)",
                          transition: "all 0.18s ease",
                          flexShrink: 0,
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ChevronRightIcon size={17} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

            ) : (
              /* ─── Sub-page shell ─── */
              <Box>
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
