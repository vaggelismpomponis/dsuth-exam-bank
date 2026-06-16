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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const svgH = 200;
  const svgPadding = 20;

  const maxChartVal = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.downloads)), 5);
    return Math.ceil(maxVal / 5) * 5; // Round to nearest multiple of 5
  }, [chartData]);

  // Points calculator
  const points = useMemo(() => {
    if (chartData.length === 0) return { viewsLine: '', downloadsLine: '', viewsArea: '', downloadsArea: '', xCoords: [] };

    const getX = (index) => {
      const denom = chartData.length > 1 ? chartData.length - 1 : 1;
      return svgPadding + (index / denom) * (svgW - 2 * svgPadding);
    };

    const getY = (val) => {
      return svgH - svgPadding - (val / maxChartVal) * (svgH - 2 * svgPadding);
    };

    const vCoords = chartData.map((d, i) => [getX(i), getY(d.views)]);
    const dCoords = chartData.map((d, i) => [getX(i), getY(d.downloads)]);

    const viewsLine = vCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');
    const downloadsLine = dCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${c[1]}`).join(' ');

    const bottomY = svgH - svgPadding;
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

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* ── Title & Filter Header ── */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 1.5 },
          mb: { xs: 1.5, sm: 0 }
        }}>
          <Box>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: { xs: '1.4rem', sm: '1.6rem' } }}>
              Αναλυτικά Στατιστικά
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              Παρακολούθηση επισκεψιμότητας, λήψεων και δραστηριότητας χρηστών
            </Typography>
          </Box>
          {/* On mobile: controls stack nicely below the title */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            <IconButton onClick={handleRefresh} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 0.75 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: { xs: 130, sm: 160 }, flexGrow: { xs: 1, sm: 0 } }}>
              <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Χρονικό Εύρος</InputLabel>
              <Select
                value={timeframe}
                label="Χρονικό Εύρος"
                onChange={(e) => setTimeframe(e.target.value)}
                sx={{ borderRadius: '10px', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                <MenuItem value="24h">Τελ. 24ωρο</MenuItem>
                <MenuItem value="7d">Τελ. 7 ημέρες</MenuItem>
                <MenuItem value="30d">Τελ. 30 ημέρες</MenuItem>
                <MenuItem value="all">Όλα</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
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
          {/* ── Section: Website Traffic Frequencies (DAU / WAU / MAU) ── */}
          <Paper sx={{
            p: { xs: 1.5, sm: 3 }, mb: { xs: 2, sm: 4 }, borderRadius: '16px',
            border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            background: dark ? 'linear-gradient(135deg, #1e2025 0%, #17181c 100%)' : '#fff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, overflow: 'hidden' }}>
              <PeopleIcon color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', sm: '1.05rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Κίνηση &amp; Επισκεψιμότητα
              </Typography>
              <Chip size="small" label={`${events.length}`} variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: '8px', ml: 'auto', opacity: 0.65, flexShrink: 0 }} />
            </Box>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {[
                { label: '24ωρο', uv: trafficStats.day.uv, pv: trafficStats.day.pv, color: '#1a73e8' },
                { label: '7 ημέρες', uv: trafficStats.week.uv, pv: trafficStats.week.pv, color: '#7b1fa2' },
                { label: '30 ημέρες', uv: trafficStats.month.uv, pv: trafficStats.month.pv, color: '#2e7d32' },
              ].map((seg) => (
                <Grid key={seg.label} item xs={12} sm={4}>
                  <Box sx={{
                    p: { xs: 1.5, sm: 2 }, borderRadius: '12px',
                    bgcolor: dark ? alpha(seg.color, 0.05) : alpha(seg.color, 0.03),
                    border: '1px solid', borderColor: dark ? alpha(seg.color, 0.15) : alpha(seg.color, 0.1),
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'column' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    justifyContent: { xs: 'space-between', sm: 'flex-start' },
                    gap: { xs: 2, sm: 0.5 }
                  }}>
                    <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.65rem' }, textTransform: 'uppercase', flexShrink: 0 }}>
                      {seg.label}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: { xs: 2.5, sm: 1.5 }, alignItems: 'center', ml: { xs: 'auto', sm: 0 } }}>
                      <Stack direction="row" spacing={0.5} alignItems="baseline">
                        <Typography sx={{ fontWeight: 800, color: seg.color, fontSize: { xs: '1.15rem', sm: '1.8rem' }, lineHeight: 1 }}>{seg.uv}</Typography>
                        <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary' }}>UV</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="baseline">
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.15rem', sm: '1.1rem' }, lineHeight: 1 }}>{seg.pv}</Typography>
                        <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary' }}>PV</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* ── KPI Overview Cards ── */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 4 } }}>
            {[{
              icon: <VisibilityIcon fontSize="small" />,
              label: 'Προβολές',
              value: stats.kpis.views,
              color: theme.palette.primary.main
            }, {
              icon: <ArticleIcon fontSize="small" />,
              label: 'Προεπισκοπήσεις',
              value: stats.kpis.previews,
              color: theme.palette.info.main
            }, {
              icon: <DownloadIcon fontSize="small" />,
              label: 'Λήψεις',
              value: stats.kpis.downloads,
              color: theme.palette.secondary.main
            }, {
              icon: <CloudUploadIcon fontSize="small" />,
              label: 'Μεταφορτώσεις',
              value: stats.kpis.uploads,
              color: theme.palette.success.main
            }].map((kpi, idx) => (
              <Grid key={idx} item xs={6} md={3}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff', height: '100%' }}>
                  <CardContent sx={{ p: { xs: 1.25, sm: 2.5 }, '&:last-child': { pb: { xs: 1.25, sm: 2.5 } } }}>
                    <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(kpi.color, 0.15), color: kpi.color, borderRadius: '8px', width: { xs: 28, sm: 40 }, height: { xs: 28, sm: 40 }, flexShrink: 0 }}>
                        {kpi.icon}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', fontSize: { xs: '0.62rem', sm: '0.75rem' }, lineHeight: 1.3 }}>{kpi.label}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' }, lineHeight: 1.1, mt: 0.2 }}>{kpi.value}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ── Section: Custom SVG Chart & Trends ── */}
          <Paper sx={{
            p: { xs: 1.5, sm: 3 }, mb: { xs: 2, sm: 4 }, borderRadius: '16px',
            border: '1px solid', borderColor: 'divider',
            bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff',
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimelineIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem' }}>
                  Διάγραμμα Τάσεων
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: 'primary.main', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Προβολές</Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: 'secondary.main', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Λήψεις</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Custom SVG Line Chart */}
            <Box sx={{ width: '100%', position: 'relative' }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  {/* Gradients */}
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.secondary.main} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = svgPadding + ratio * (svgH - 2 * svgPadding);
                  const gridVal = Math.round(maxChartVal - ratio * maxChartVal);
                  return (
                    <g key={index}>
                      <line
                        x1={svgPadding}
                        y1={y}
                        x2={svgW - svgPadding}
                        y2={y}
                        stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgPadding - 5}
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
                    stroke={theme.palette.secondary.main}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interaction Dots / Indicators */}
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
                          r="3.5"
                          fill={theme.palette.primary.main}
                          stroke={dark ? '#111214' : '#fff'}
                          strokeWidth="1.5"
                        />
                      )}
                      {d.downloads > 0 && (
                        <circle
                          cx={points.dCoords[i][0]}
                          cy={points.dCoords[i][1]}
                          r="3.5"
                          fill={theme.palette.secondary.main}
                          stroke={dark ? '#111214' : '#fff'}
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {chartData.map((d, i) => {
                  // Show fewer labels on longer ranges to prevent overlap
                  const showLabel =
                    timeframe === '24h' ? i % 4 === 0 :
                    timeframe === '7d' ? true :
                    i % 5 === 0 || i === chartData.length - 1;

                  if (!showLabel) return null;

                  const denom = chartData.length > 1 ? chartData.length - 1 : 1;
                  const x = svgPadding + (i / denom) * (svgW - 2 * svgPadding);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={svgH - 2}
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
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 4 }}>
            {/* Top Courses */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Paper sx={{
                width: '100%',
                p: { xs: 1.5, sm: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
                bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff', height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    Δημοφιλή Μαθήματα (Προβολές)
                  </Typography>
                </Box>
                {stats.topCourses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Δεν υπάρχουν δεδομένα προβολών
                  </Typography>
                ) : (
                  <Stack spacing={2.5}>
                    {stats.topCourses.map((c, i) => {
                      const maxCount = stats.topCourses[0].count || 1;
                      const pct = (c.count / maxCount) * 100;
                      return (
                        <Box key={i}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, gap: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                              {i + 1}. {c.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', flexShrink: 0 }}>
                              {c.count} {c.count === 1 ? 'επίσκεψη' : 'επισκέψεις'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              '& .MuiLinearProgress-bar': { borderRadius: 4 }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Top Downloaded Files */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Paper sx={{
                width: '100%',
                p: { xs: 1.5, sm: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
                bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff', height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <DownloadIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
                    Δημοφιλή Αρχεία (Λήψεις)
                  </Typography>
                </Box>
                {stats.topExams.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Δεν υπάρχουν δεδομένα λήψεων
                  </Typography>
                ) : (
                  <Stack spacing={2.5}>
                    {stats.topExams.map((exam, i) => {
                      const maxCount = stats.topExams[0].count || 1;
                      const pct = (exam.count / maxCount) * 100;
                      return (
                        <Box key={i}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, gap: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                              {i + 1}. {exam.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main', flexShrink: 0 }}>
                              {exam.count} {exam.count === 1 ? 'λήψη' : 'λήψεις'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            color="secondary"
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              '& .MuiLinearProgress-bar': { borderRadius: 4 }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── Section: Live Real-time Activity Feed ── */}
          <Paper sx={{
            width: '100%',
            p: { xs: 1.5, sm: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
            bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NavigationIcon color="primary" sx={{ transform: 'rotate(90deg)' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
                Πρόσφατη Δραστηριότητα (Live Feed)
              </Typography>
            </Box>
            {feedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={28} />
              </Box>
            ) : feedEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Δεν υπάρχουν πρόσφατα συμβάντα
              </Typography>
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
                          p: 1.75,
                          borderRadius: '12px',
                          bgcolor: dark ? alpha('#fff', 0.03) : alpha('#000', 0.015),
                          border: '1px solid',
                          borderColor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
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
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: { xs: 320, sm: 600 } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ώρα</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ενέργεια</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>Σελίδα/Αρχείο</TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Ταυτότητα</TableCell>
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
                            <TableRow key={e.id} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{timeStr}</Typography>
                                <Typography variant="caption" color="text.disabled">{dateStr}</Typography>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Chip
                                  size="small"
                                  label={getEventNameGreek(e.event_type)}
                                  color={getEventColor(e.event_type)}
                                  variant="outlined"
                                  sx={{ fontWeight: 700, fontSize: { xs: '0.68rem', sm: '0.75rem' }, borderRadius: '8px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ maxWidth: { sm: 260, md: 320 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>
                                <Tooltip title={details} placement="top">
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{details}</Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
