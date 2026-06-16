import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, LinearProgress, Avatar, Stack, Card, CardContent,
  useTheme, alpha, Button, IconButton, Tooltip, useMediaQuery
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArticleIcon from '@mui/icons-material/Article';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavigationIcon from '@mui/icons-material/Navigation';

import { supabase } from '../../supabaseClient';

const AdminAnalytics = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [timeframe, setTimeframe] = useState('24h'); // 24h, 7d, 30d, all
  const [events, setEvents] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); // user_id -> display name
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Live Feed pagination state ────────────────────
  const [feedEvents, setFeedEvents] = useState([]);
  const [feedTotal, setFeedTotal] = useState(0);
  const [feedPage, setFeedPage] = useState(0);
  const [feedPageSize, setFeedPageSize] = useState(10);
  const [feedLoading, setFeedLoading] = useState(false);

  // Helper: date limit calculators
  const getDateLimit = (range) => {
    const d = new Date();
    if (range === '24h') d.setHours(d.getHours() - 24);
    else if (range === '7d') d.setDate(d.getDate() - 7);
    else if (range === '30d') d.setDate(d.getDate() - 30);
    else return null;
    return d.toISOString();
  };

  // ── Data fetching ────────────────────────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const limit = getDateLimit(timeframe);

        // NOTE: We intentionally avoid FK joins (courses/exams) here because
        // Supabase throws "multiple relationships found" when there is ambiguity.
        // All label resolution falls back to the metadata JSONB column instead.
        let query = supabase
          .from('analytics_events')
          .select('id, event_type, page_path, visitor_id, user_id, course_id, exam_id, created_at, metadata')
          .order('created_at', { ascending: false })
          .limit(2000);

        if (limit) {
          query = query.gte('created_at', limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        const eventsData = data || [];
        setEvents(eventsData);

        // Batch-fetch profile names for all authenticated user_ids
        const userIds = [...new Set(eventsData.map(e => e.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, role')
            .in('id', userIds);
          if (profiles) {
            const map = {};
            profiles.forEach(p => {
              const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
              map[p.id] = { name: name || p.email || 'Χρήστης', role: p.role };
            });
            setUserProfiles(map);
          }
        }
      } catch (err) {
        console.error('[Analytics] fetch error:', err);
        setFetchError(err?.message || 'Σφάλμα φόρτωσης δεδομένων');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, refreshKey]);

  // ── Live Feed: server-side paginated fetch ────────
  useEffect(() => {
    const fetchFeed = async () => {
      setFeedLoading(true);
      try {
        const limit = getDateLimit(timeframe);
        const from = feedPage * feedPageSize;
        const to = from + feedPageSize - 1;

        let query = supabase
          .from('analytics_events')
          .select('id, event_type, page_path, visitor_id, user_id, created_at, metadata', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (limit) query = query.gte('created_at', limit);

        const { data, error, count } = await query;
        if (error) throw error;

        const rows = data || [];
        setFeedEvents(rows);
        setFeedTotal(count ?? 0);

        // Fetch profiles only for user_ids on this page
        const pageUserIds = [...new Set(rows.map(e => e.user_id).filter(Boolean))];
        if (pageUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, role')
            .in('id', pageUserIds);
          if (profiles) {
            setUserProfiles(prev => {
              const next = { ...prev };
              profiles.forEach(p => {
                const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
                next[p.id] = { name: name || p.email || 'Χρήστης', role: p.role };
              });
              return next;
            });
          }
        }
      } catch (err) {
        console.error('[Analytics] feed fetch error:', err);
      } finally {
        setFeedLoading(false);
      }
    };

    fetchFeed();
  }, [timeframe, refreshKey, feedPage, feedPageSize]);

  // ── Traffic Stats: DAU / WAU / MAU ──────────────────
  const trafficStats = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const visitorsDay = new Set();
    const visitorsWeek = new Set();
    const visitorsMonth = new Set();

    let pageViewsDay = 0;
    let pageViewsWeek = 0;
    let pageViewsMonth = 0;

    events.forEach(event => {
      const dt = new Date(event.created_at);
      const isPV = event.event_type === 'page_view';

      if (dt >= oneDayAgo) {
        visitorsDay.add(event.visitor_id);
        if (isPV) pageViewsDay++;
      }
      if (dt >= oneWeekAgo) {
        visitorsWeek.add(event.visitor_id);
        if (isPV) pageViewsWeek++;
      }
      if (dt >= oneMonthAgo) {
        visitorsMonth.add(event.visitor_id);
        if (isPV) pageViewsMonth++;
      }
    });

    return {
      day: { uv: visitorsDay.size, pv: pageViewsDay },
      week: { uv: visitorsWeek.size, pv: pageViewsWeek },
      month: { uv: visitorsMonth.size, pv: pageViewsMonth }
    };
  }, [events]);

  // ── Aggregation & KPI logic ──────────────────────────
  const stats = useMemo(() => {
    let views = 0;
    let previews = 0;
    let downloads = 0;
    let uploads = 0;

    const courseViews = {};
    const examDownloads = {};

    events.forEach(event => {
      const type = event.event_type;

      if (type === 'page_view') {
        views++;
        // Use metadata.courseName since we no longer join courses table
        const courseName = event.metadata?.courseName;
        if (courseName) {
          courseViews[courseName] = (courseViews[courseName] || 0) + 1;
        }
      } else if (type === 'preview') {
        previews++;
      } else if (type === 'download') {
        downloads++;
        // Use metadata.filename since we no longer join exams table
        const examLabel = event.metadata?.filename || event.metadata?.courseName || 'Άγνωστο Αρχείο';
        examDownloads[examLabel] = (examDownloads[examLabel] || 0) + 1;
      } else if (type === 'download_all') {
        const count = event.metadata?.filesCount || 1;
        downloads += count;
        const courseName = event.metadata?.courseName || 'Bulk ZIP';
        examDownloads[`[ZIP] ${courseName}`] = (examDownloads[`[ZIP] ${courseName}`] || 0) + 1;
      } else if (type === 'upload') {
        uploads++;
      }
    });

    // Sort rankings
    const topCourses = Object.entries(courseViews)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topExams = Object.entries(examDownloads)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      kpis: { views, previews, downloads, uploads, uniqueUsers: new Set(events.map(e => e.visitor_id)).size },
      topCourses,
      topExams
    };
  }, [events]);

  // ── SVG Chart preparation ───────────────────────────
  const chartData = useMemo(() => {
    // Generate dates based on timeframe
    const dates = [];
    const steps = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;

    const today = new Date();
    for (let i = steps - 1; i >= 0; i--) {
      const d = new Date();
      if (timeframe === '24h') {
        d.setHours(today.getHours() - i);
        dates.push({
          key: d.getHours() + ':00',
          label: d.getHours() + ':00',
          views: 0,
          downloads: 0
        });
      } else {
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push({
          key: dateStr,
          label: d.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' }),
          views: 0,
          downloads: 0
        });
      }
    }

    // Bucket events
    events.forEach(e => {
      const dt = new Date(e.created_at);
      let matchKey = '';
      if (timeframe === '24h') {
        matchKey = dt.getHours() + ':00';
      } else {
        matchKey = dt.toISOString().split('T')[0];
      }

      const bucket = dates.find(d => d.key === matchKey);
      if (bucket) {
        if (e.event_type === 'page_view') bucket.views++;
        else if (e.event_type === 'download' || e.event_type === 'download_all') {
          bucket.downloads += e.metadata?.filesCount || 1;
        }
      }
    });

    return dates;
  }, [events, timeframe]);

  // SVG dimensions
  const svgW = 600;
  const svgH = 220;
  const svgPadL = 32;
  const svgPadR = 20;
  const svgPadT = 16;
  const svgPadB = 28;

  const maxChartVal = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.downloads)), 5);
    return Math.ceil(maxVal / 5) * 5; // Round to nearest multiple of 5
  }, [chartData]);

  // Points calculator
  const points = useMemo(() => {
    if (chartData.length === 0) return { viewsLine: '', downloadsLine: '', viewsArea: '', downloadsArea: '', xCoords: [] };

    const getX = (index) => {
      const denom = chartData.length > 1 ? chartData.length - 1 : 1;
      return svgPadL + (index / denom) * (svgW - svgPadL - svgPadR);
    };

    const getY = (val) => {
      return svgH - svgPadB - (val / maxChartVal) * (svgH - svgPadT - svgPadB);
    };

    const vCoords = chartData.map((d, i) => [getX(i), getY(d.views)]);
    const dCoords = chartData.map((d, i) => [getX(i), getY(d.downloads)]);

    const viewsLine = vCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');
    const downloadsLine = dCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');

    const bottomY = svgH - svgPadB;
    const viewsArea = viewsLine ? `${viewsLine} L ${vCoords[vCoords.length - 1][0]} ${bottomY} L ${vCoords[0][0]} ${bottomY} Z` : '';
    const downloadsArea = downloadsLine ? `${downloadsLine} L ${dCoords[dCoords.length - 1][0]} ${bottomY} L ${dCoords[0][0]} ${bottomY} Z` : '';

    return { viewsLine, downloadsLine, viewsArea, downloadsArea, vCoords, dCoords };
  }, [chartData, maxChartVal]);

  // feedEvents is now driven by server-side pagination state (no client-side slice needed)

  const handleRefresh = () => {
    setFeedPage(0);
    setRefreshKey(p => p + 1);
  };

  const handleFeedPageChange = (_e, newPage) => {
    setFeedPage(newPage);
  };

  const handleFeedRowsPerPageChange = (e) => {
    setFeedPageSize(parseInt(e.target.value, 10));
    setFeedPage(0);
  };

  const getEventNameGreek = (type) => {
    const map = {
      page_view: 'Προβολή Σελίδας',
      preview: 'Προεπισκόπηση',
      download: 'Λήψη Αρχείου',
      download_all: 'Λήψη ZIP',
      upload: 'Μεταφόρτωση'
    };
    return map[type] || type;
  };

  const getEventColor = (type) => {
    const map = {
      page_view: 'primary',
      preview: 'info',
      download: 'secondary',
      download_all: 'warning',
      upload: 'success'
    };
    return map[type] || 'default';
  };

  // Maps raw page paths to human-readable Greek labels
  const getReadablePath = (path, metadata) => {
    if (!path) return '-';
    // If metadata has a courseName (set for course pages & viewer), use it
    if (metadata?.courseName) return metadata.courseName;
    // Admin routes
    if (path.startsWith('/admin/analytics'))   return 'Στατιστικά (Admin)';
    if (path.startsWith('/admin/users'))        return 'Χρήστες (Admin)';
    if (path.startsWith('/admin/courses'))      return 'Μαθήματα (Admin)';
    if (path.startsWith('/admin/files'))        return 'Αρχεία (Admin)';
    if (path.startsWith('/admin/upload'))       return 'Ανέβασμα (Admin)';
    if (path.startsWith('/admin/requests'))     return 'Αιτήματα (Admin)';
    if (path.startsWith('/admin/applications')) return 'Αιτήσεις Admin';
    if (path === '/admin')                      return 'Admin Dashboard';
    // Public routes
    if (path === '/')           return 'Αρχική';
    if (path === '/courses')    return 'Μαθήματα';
    if (path === '/upload')     return 'Ανέβασμα Αρχείου';
    if (path === '/favorites')  return 'Αγαπημένα';
    if (path === '/profile')    return 'Προφίλ';
    if (path === '/login')      return 'Σύνδεση';
    if (path === '/register')   return 'Εγγραφή';
    if (path === '/contact')    return 'Επικοινωνία';
    if (path === '/faq')        return 'Συχνές Ερωτήσεις';
    if (path === '/students')   return 'Κατάλογος Φοιτητών';
    if (path === '/requests')   return 'Αιτήματα';
    if (path === '/viewer')     return `Προβολή: ${metadata?.fileName || 'Αρχείο'}`;
    if (path === '/privacy')    return 'Πολιτική Απορρήτου';
    if (path.startsWith('/admin-application')) return 'Αίτηση Admin';
    // Course detail pages — courseId known but name not in metadata yet
    const courseMatch = path.match(/^\/courses\/(.+)/);
    if (courseMatch) return `Μάθημα #${courseMatch[1]}`;
    return path;
  };

  // ── Section label component ──────────────────────────
  const SectionLabel = ({ icon, title, subtitle, right, compact = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: compact ? 1.5 : 2, sm: 3 }, gap: 1, flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={{ xs: compact ? 1 : 1.5, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{
          width: { xs: compact ? 28 : 36, sm: 36 },
          height: { xs: compact ? 28 : 36, sm: 36 },
          borderRadius: { xs: '8px', sm: '10px' },
          background: dark
            ? 'linear-gradient(135deg, rgba(26,115,232,0.25) 0%, rgba(26,115,232,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(26,115,232,0.15) 0%, rgba(26,115,232,0.05) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'primary.main', flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{
            fontWeight: 800,
            fontSize: { xs: compact ? '0.78rem' : '1rem', sm: '1rem' },
            lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal',
          }}>{title}</Typography>
          {subtitle && !compact && (
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, display: { xs: 'none', sm: 'block' } }}>{subtitle}</Typography>
          )}
        </Box>
      </Stack>
      {right && <Box sx={{ display: compact ? 'none' : 'block' }}>{right}</Box>}
    </Box>
  );

  const trafficSegments = [
    { label: '24 ώρες', shortLabel: '24ωρο', uv: trafficStats.day.uv, pv: trafficStats.day.pv, color: '#1a73e8', gradient: 'linear-gradient(135deg, #1a73e8, #0052cc)' },
    { label: '7 ημέρες', shortLabel: '7 ημέρες', uv: trafficStats.week.uv, pv: trafficStats.week.pv, color: '#7b1fa2', gradient: 'linear-gradient(135deg, #7b1fa2, #6a1b9a)' },
    { label: '30 ημέρες', shortLabel: '30 ημέρες', uv: trafficStats.month.uv, pv: trafficStats.month.pv, color: '#2e7d32', gradient: 'linear-gradient(135deg, #2e7d32, #1b5e20)' },
  ];

  const kpiCards = [{
    icon: <VisibilityIcon />,
    label: 'Προβολές',
    value: stats.kpis.views,
    color: theme.palette.primary.main,
    bg: dark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.07)',
  }, {
    icon: <ArticleIcon />,
    label: 'Προεπισκοπήσεις',
    value: stats.kpis.previews,
    color: theme.palette.info.main,
    bg: dark ? 'rgba(26,115,232,0.1)' : 'rgba(26,115,232,0.05)',
  }, {
    icon: <DownloadIcon />,
    label: 'Λήψεις',
    value: stats.kpis.downloads,
    color: '#5f6368',
    bg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(95,99,104,0.07)',
  }, {
    icon: <CloudUploadIcon />,
    label: 'Μεταφορτώσεις',
    value: stats.kpis.uploads,
    color: theme.palette.success.main,
    bg: dark ? 'rgba(30,142,62,0.12)' : 'rgba(30,142,62,0.07)',
  }];

  return (
    <Box sx={{ animation: 'fadeIn 0.35s ease', overflowX: 'hidden', width: '100%', minWidth: 0 }}>

      {/* ── Title & Filter Header ── */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: { xs: 3, sm: 4 },
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.45rem', sm: '1.7rem' }, letterSpacing: '-0.02em' }}>
            Αναλυτικά Στατιστικά
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Παρακολούθηση επισκεψιμότητας, λήψεων και δραστηριότητας χρηστών
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Tooltip title="Ανανέωση">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{
                border: '1px solid', borderColor: 'divider',
                borderRadius: '10px', p: 0.9,
                '&:hover': { bgcolor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.04) },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontSize: '0.875rem' }}>Χρονικό Εύρος</InputLabel>
            <Select
              value={timeframe}
              label="Χρονικό Εύρος"
              onChange={(e) => setTimeframe(e.target.value)}
              sx={{ borderRadius: '10px', fontSize: '0.875rem' }}
            >
              <MenuItem value="24h">Τελ. 24ωρο</MenuItem>
              <MenuItem value="7d">Τελ. 7 ημέρες</MenuItem>
              <MenuItem value="30d">Τελ. 30 ημέρες</MenuItem>
              <MenuItem value="all">Όλα</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Φόρτωση στατιστικών...</Typography>
        </Box>
      ) : fetchError ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700, mb: 1 }}>Σφάλμα φόρτωσης</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace', bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>{fetchError}</Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Επανάληψη</Button>
        </Box>
      ) : (
        <>
          {/* ── Section: Traffic (DAU / WAU / MAU) ── */}
          <Paper sx={{
            p: { xs: 2.5, sm: 3.5 }, mb: { xs: 2.5, sm: 3.5 }, borderRadius: '20px',
            border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            background: dark
              ? 'linear-gradient(135deg, #1e2025 0%, #17181c 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.25)' : '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Decorative blob */}
            <Box sx={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: dark ? 'rgba(26,115,232,0.05)' : 'rgba(26,115,232,0.04)',
              pointerEvents: 'none',
            }} />
            <SectionLabel
              icon={<PeopleIcon sx={{ fontSize: 19 }} />}
              title="Κίνηση & Επισκεψιμότητα"
              subtitle="Μοναδικοί επισκέπτες (UV) & προβολές σελίδας (PV)"
              right={
                <Chip
                  size="small"
                  label={`${events.length} συμβάντα`}
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', opacity: 0.7 }}
                />
              }
            />
            {(() => {
              // Pick the active segment based on the selected timeframe
              const activeSeg =
                timeframe === '24h' ? trafficSegments[0] :
                timeframe === '7d'  ? trafficSegments[1] :
                timeframe === '30d' ? trafficSegments[2] :
                null; // 'all' → show all three

              if (activeSeg) {
                // Single focused stat for the selected timeframe
                return (
                  <Box sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: '16px',
                    background: dark ? alpha(activeSeg.color, 0.08) : alpha(activeSeg.color, 0.05),
                    border: '1px solid',
                    borderColor: dark ? alpha(activeSeg.color, 0.2) : alpha(activeSeg.color, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 3, sm: 5 },
                    flexWrap: 'wrap',
                  }}>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: activeSeg.color, fontSize: { xs: '2.2rem', sm: '3rem' }, lineHeight: 1, letterSpacing: '-0.04em' }}>
                        {activeSeg.uv}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.5 }}>
                        Μοναδικοί Επισκέπτες
                      </Typography>
                    </Box>
                    <Box sx={{ width: '1px', height: { xs: 48, sm: 60 }, bgcolor: dark ? alpha(activeSeg.color, 0.2) : alpha(activeSeg.color, 0.15), flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '2.2rem', sm: '3rem' }, lineHeight: 1, letterSpacing: '-0.04em' }}>
                        {activeSeg.pv}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.5 }}>
                        Προβολές Σελίδας
                      </Typography>
                    </Box>
                  </Box>
                );
              }

              // 'all' → show all three side-by-side
              return (
                <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
                  {trafficSegments.map((seg) => (
                    <Grid key={seg.label} item xs={4}>
                      <Box sx={{
                        p: { xs: 1.5, sm: 2.5 },
                        borderRadius: '16px',
                        background: dark ? alpha(seg.color, 0.08) : alpha(seg.color, 0.05),
                        border: '1px solid',
                        borderColor: dark ? alpha(seg.color, 0.2) : alpha(seg.color, 0.15),
                        display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1.5 },
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <Box sx={{
                          display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
                          px: 1, py: 0.3, borderRadius: '6px',
                          background: seg.gradient,
                        }}>
                          <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: { xs: '0.58rem', sm: '0.65rem' }, lineHeight: 1 }}>
                            {seg.shortLabel}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2.5 }, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: seg.color, fontSize: { xs: '1.35rem', sm: '2rem' }, lineHeight: 1, letterSpacing: '-0.03em' }}>
                              {seg.uv}
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              UV
                            </Typography>
                          </Box>
                          <Box sx={{ width: '1px', height: 28, bgcolor: dark ? alpha(seg.color, 0.2) : alpha(seg.color, 0.15), display: { xs: 'none', sm: 'block' } }} />
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.4rem' }, lineHeight: 1, letterSpacing: '-0.02em' }}>
                              {seg.pv}
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              PV
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </Paper>

          {/* ── KPI Overview Cards ── */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2.5, sm: 3.5 },
          }}>
            {kpiCards.map((kpi, idx) => (
              <Box key={idx} sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '18px',
                bgcolor: kpi.bg,
                border: '1px solid',
                borderColor: dark ? alpha(kpi.color, 0.18) : alpha(kpi.color, 0.15),
                display: 'flex', flexDirection: 'column', gap: 1.5,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative', overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 32px ${alpha(kpi.color, 0.18)}`,
                },
              }}>
                {/* Decorative circle */}
                <Box sx={{
                  position: 'absolute', top: -20, right: -20,
                  width: 70, height: 70, borderRadius: '50%',
                  bgcolor: alpha(kpi.color, 0.08), pointerEvents: 'none',
                }} />
                <Avatar sx={{
                  bgcolor: alpha(kpi.color, 0.15), color: kpi.color,
                  borderRadius: '11px', width: 40, height: 40,
                  '& svg': { fontSize: 20 },
                }}>
                  {kpi.icon}
                </Avatar>
                <Box>
                  <Typography sx={{
                    fontWeight: 900, color: kpi.color,
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    lineHeight: 1, letterSpacing: '-0.03em',
                  }}>
                    {kpi.value}
                  </Typography>
                  <Typography sx={{
                    fontWeight: 600, color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.78rem' },
                    mt: 0.4, lineHeight: 1.2,
                  }}>
                    {kpi.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── Section: SVG Chart & Trends ── */}
          <Paper sx={{
            p: { xs: 2, sm: 3.5 }, mb: { xs: 2.5, sm: 3.5 }, borderRadius: '20px',
            border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            bgcolor: dark ? '#1a1b1f' : '#fff',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <SectionLabel
              icon={<TimelineIcon sx={{ fontSize: 19 }} />}
              title="Διάγραμμα Τάσεων"
              subtitle={`Δεδομένα ανά ${timeframe === '24h' ? 'ώρα' : 'ημέρα'} για το επιλεγμένο εύρος`}
              right={
                <Stack direction="row" spacing={2}>
                  {[
                    { color: theme.palette.primary.main, label: 'Προβολές' },
                    { color: '#5f6368', label: 'Λήψεις' },
                  ].map(l => (
                    <Stack key={l.label} direction="row" spacing={0.75} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: l.color, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: 'text.secondary' }}>{l.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              }
            />

            {/* Custom SVG Line Chart */}
            <Box sx={{ width: '100%', position: 'relative' }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5f6368" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#5f6368" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = svgPadT + ratio * (svgH - svgPadT - svgPadB);
                  const gridVal = Math.round(maxChartVal - ratio * maxChartVal);
                  return (
                    <g key={index}>
                      <line
                        x1={svgPadL}
                        y1={y}
                        x2={svgW - svgPadR}
                        y2={y}
                        stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgPadL - 6}
                        y={y + 4}
                        textAnchor="end"
                        fill={theme.palette.text.disabled}
                        fontSize="9px"
                        fontWeight="600"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Areas */}
                {points.viewsArea && <path d={points.viewsArea} fill="url(#viewsGrad)" />}
                {points.downloadsArea && <path d={points.downloadsArea} fill="url(#downloadsGrad)" />}

                {/* Lines */}
                {points.viewsLine && (
                  <path
                    d={points.viewsLine}
                    fill="none"
                    stroke={theme.palette.primary.main}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {points.downloadsLine && (
                  <path
                    d={points.downloadsLine}
                    fill="none"
                    stroke="#5f6368"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interaction Dots */}
                {chartData.length <= 30 && points.vCoords && points.vCoords.map((c, i) => {
                  const d = chartData[i];
                  const hasData = d.views > 0 || d.downloads > 0;
                  if (!hasData) return null;
                  return (
                    <g key={i}>
                      {d.views > 0 && (
                        <circle
                          cx={c[0]}
                          cy={c[1]}
                          r="4"
                          fill={theme.palette.primary.main}
                          stroke={dark ? '#1a1b1f' : '#fff'}
                          strokeWidth="2"
                        />
                      )}
                      {d.downloads > 0 && (
                        <circle
                          cx={points.dCoords[i][0]}
                          cy={points.dCoords[i][1]}
                          r="4"
                          fill="#5f6368"
                          stroke={dark ? '#1a1b1f' : '#fff'}
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {chartData.map((d, i) => {
                  const showLabel =
                    timeframe === '24h' ? i % 4 === 0 :
                    timeframe === '7d' ? true :
                    i % 5 === 0 || i === chartData.length - 1;

                  if (!showLabel) return null;

                  const denom = chartData.length > 1 ? chartData.length - 1 : 1;
                  const x = svgPadL + (i / denom) * (svgW - svgPadL - svgPadR);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={svgH - 4}
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="9px"
                      fontWeight="500"
                    >
                      {d.label}
                    </text>
                  );
                })}
              </svg>
            </Box>
          </Paper>

          {/* ── Rankings lists ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 }, mb: { xs: 2.5, sm: 3.5 } }}>
            {/* Top Courses */}
            <Paper sx={{
              p: { xs: 2, sm: 3 }, borderRadius: { xs: '16px', sm: '20px' },
              border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              bgcolor: dark ? '#1a1b1f' : '#fff',
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <SectionLabel
                icon={<TrendingUpIcon sx={{ fontSize: { xs: 16, sm: 19 } }} />}
                title="Δημοφιλή Μαθήματα"
                subtitle="Κατάταξη κατά αριθμό προβολών"
                compact
              />
              {stats.topCourses.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Δεν υπάρχουν δεδομένα προβολών</Typography>
                </Box>
              ) : (
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  {stats.topCourses.map((c, i) => {
                    const maxCount = stats.topCourses[0].count || 1;
                    const pct = (c.count / maxCount) * 100;
                    return (
                      <Box key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, gap: 1, minWidth: 0 }}>
                          {/* Rank badge */}
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                            background: i === 0
                              ? 'linear-gradient(135deg, #f9ab00, #f57c00)'
                              : i === 1
                              ? 'linear-gradient(135deg, #9aa0a6, #757575)'
                              : i === 2
                              ? 'linear-gradient(135deg, #c8a870, #a07850)'
                              : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: i < 3 ? '#fff' : 'text.secondary' }}>
                              {i + 1}
                            </Typography>
                          </Box>
                          {/* Name */}
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.875rem',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            {c.name}
                          </Typography>
                          {/* Count */}
                          <Typography sx={{ fontWeight: 800, color: 'primary.main', flexShrink: 0, fontSize: '0.85rem', pl: 0.5 }}>
                            {c.count}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: { xs: 5, sm: 6 },
                            borderRadius: 100,
                            bgcolor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': { borderRadius: 100 }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {/* Top Downloaded Files */}
            <Paper sx={{
              p: { xs: 2, sm: 3 }, borderRadius: { xs: '16px', sm: '20px' },
              border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              bgcolor: dark ? '#1a1b1f' : '#fff',
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <SectionLabel
                icon={<DownloadIcon sx={{ fontSize: { xs: 16, sm: 19 } }} />}
                title="Δημοφιλή Αρχεία"
                subtitle="Κατάταξη κατά αριθμό λήψεων"
                compact
              />
              {stats.topExams.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Δεν υπάρχουν δεδομένα λήψεων</Typography>
                </Box>
              ) : (
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  {stats.topExams.map((exam, i) => {
                    const maxCount = stats.topExams[0].count || 1;
                    const pct = (exam.count / maxCount) * 100;
                    return (
                      <Box key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, gap: 1, minWidth: 0 }}>
                          {/* Rank badge */}
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                            background: i === 0
                              ? 'linear-gradient(135deg, #f9ab00, #f57c00)'
                              : i === 1
                              ? 'linear-gradient(135deg, #9aa0a6, #757575)'
                              : i === 2
                              ? 'linear-gradient(135deg, #c8a870, #a07850)'
                              : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: i < 3 ? '#fff' : 'text.secondary' }}>
                              {i + 1}
                            </Typography>
                          </Box>
                          {/* Name */}
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.875rem',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            {exam.name}
                          </Typography>
                          {/* Count */}
                          <Typography sx={{ fontWeight: 800, color: 'text.secondary', flexShrink: 0, fontSize: '0.85rem', pl: 0.5 }}>
                            {exam.count}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          color="inherit"
                          sx={{
                            height: { xs: 5, sm: 6 },
                            borderRadius: 100,
                            bgcolor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 100,
                              bgcolor: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Box>

          {/* ── Section: Live Real-time Activity Feed ── */}
          <Paper sx={{
            p: { xs: 2, sm: 3.5 }, borderRadius: '20px',
            border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            bgcolor: dark ? '#1a1b1f' : '#fff',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <SectionLabel
              icon={<NavigationIcon sx={{ fontSize: 19, transform: 'rotate(90deg)' }} />}
              title="Πρόσφατη Δραστηριότητα"
              subtitle="Live Feed — τελευταία συμβάντα χρηστών"
            />
            {feedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : feedEvents.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Δεν υπάρχουν πρόσφατα συμβάντα</Typography>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {feedEvents.map((e) => {
                      const dt = new Date(e.created_at);
                      const timeStr = dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const dateStr = dt.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });

                      let details = e.event_type === 'page_view'
                        ? getReadablePath(e.page_path, e.metadata)
                        : (e.event_type === 'download' || e.event_type === 'preview')
                          ? e.metadata?.filename || e.metadata?.courseName || getReadablePath(e.page_path, e.metadata)
                          : e.event_type === 'upload'
                            ? `${e.metadata?.courseName || 'Μάθημα'}${e.metadata?.year ? ` ${e.metadata.year}` : ''}${e.metadata?.period ? ` (${e.metadata.period})` : ''}`
                            : e.event_type === 'download_all'
                              ? `ZIP: ${e.metadata?.courseName || 'Όλα τα αρχεία'}`
                              : getReadablePath(e.page_path, e.metadata);

                      return (
                        <Box key={e.id} sx={{
                          p: 2,
                          borderRadius: '14px',
                          bgcolor: dark ? alpha('#fff', 0.03) : alpha('#000', 0.015),
                          border: '1px solid',
                          borderColor: dark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
                          transition: 'border-color 0.15s',
                          '&:hover': { borderColor: dark ? alpha('#fff', 0.12) : alpha('#000', 0.12) },
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                            <Chip
                              size="small"
                              label={getEventNameGreek(e.event_type)}
                              color={getEventColor(e.event_type)}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: '0.68rem', borderRadius: '8px' }}
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>{timeStr}</Typography>
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>{dateStr}</Typography>
                            </Box>
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.25, wordBreak: 'break-word' }}>
                            {details}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {e.user_id && userProfiles[e.user_id] ? (
                              <Chip
                                size="small"
                                label={userProfiles[e.user_id].name}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px', height: 22, maxWidth: 180 }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                label={`Ανών. (${(e.visitor_id || 'anon').substring(0, 6)})`}
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px', height: 22, color: 'text.secondary', maxWidth: 180 }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer sx={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <Table size="small" sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)' }}>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.78rem', py: 1.5 }}>Ώρα</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.78rem', py: 1.5 }}>Ενέργεια</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.78rem', py: 1.5, display: { xs: 'none', sm: 'table-cell' } }}>Σελίδα / Αρχείο</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.78rem', py: 1.5 }}>Ταυτότητα</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedEvents.map((e) => {
                          const dt = new Date(e.created_at);
                          const timeStr = dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          const dateStr = dt.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });

                          let details = e.event_type === 'page_view'
                            ? getReadablePath(e.page_path, e.metadata)
                            : (e.event_type === 'download' || e.event_type === 'preview')
                              ? e.metadata?.filename || e.metadata?.courseName || getReadablePath(e.page_path, e.metadata)
                              : e.event_type === 'upload'
                                ? `${e.metadata?.courseName || 'Μάθημα'}${e.metadata?.year ? ` ${e.metadata.year}` : ''}${e.metadata?.period ? ` (${e.metadata.period})` : ''}`
                                : e.event_type === 'download_all'
                                  ? `ZIP: ${e.metadata?.courseName || 'Όλα τα αρχεία'}`
                                  : getReadablePath(e.page_path, e.metadata);

                          return (
                            <TableRow
                              key={e.id}
                              hover
                              sx={{
                                '&:last-child td': { border: 0 },
                                transition: 'background 0.15s',
                              }}
                            >
                              <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{timeStr}</Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>{dateStr}</Typography>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
                                <Chip
                                  size="small"
                                  label={getEventNameGreek(e.event_type)}
                                  color={getEventColor(e.event_type)}
                                  variant="outlined"
                                  sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ maxWidth: { sm: 260, md: 320 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' }, py: 1.5 }}>
                                <Tooltip title={details} placement="top">
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}>{details}</Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
                                {e.user_id && userProfiles[e.user_id] ? (
                                  <Tooltip title={`${userProfiles[e.user_id].name} • ${userProfiles[e.user_id].role || 'user'}`} placement="top">
                                    <Chip
                                      size="small"
                                      label={userProfiles[e.user_id].name}
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px', height: 22, maxWidth: { xs: 100, sm: 160 } }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title={e.visitor_id || 'anonymous'} placement="top">
                                    <Chip
                                      size="small"
                                      label={`Ανών. (${(e.visitor_id || 'anon').substring(0, 6)})`}
                                      variant="outlined"
                                      sx={{ fontWeight: 600, fontSize: '0.68rem', borderRadius: '6px', height: 22, color: 'text.secondary', maxWidth: { xs: 100, sm: 160 } }}
                                    />
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <TablePagination
                  component="div"
                  count={feedTotal}
                  page={feedPage}
                  onPageChange={handleFeedPageChange}
                  rowsPerPage={feedPageSize}
                  onRowsPerPageChange={handleFeedRowsPerPageChange}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Γραμμές:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} / ${count !== -1 ? count : `>${to}`}`
                  }
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 1,
                    '.MuiTablePagination-selectLabel': {
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: { xs: 'none', sm: 'block' }
                    },
                    '.MuiTablePagination-select, .MuiTablePagination-selectIcon': {
                      display: { xs: 'none', sm: 'inline-flex' }
                    },
                    '.MuiTablePagination-displayedRows': {
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminAnalytics;
