import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, LinearProgress, Avatar, Stack, Card, CardContent,
  useTheme, alpha, Button, IconButton, Tooltip
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

  const [timeframe, setTimeframe] = useState('30d'); // 24h, 7d, 30d, all
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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
      try {
        const limit = getDateLimit(timeframe);
        
        let query = supabase
          .from('analytics_events')
          .select(`
            id,
            event_type,
            page_path,
            visitor_id,
            created_at,
            metadata,
            courses (
              name
            ),
            exams (
              year,
              period,
              course
            )
          `)
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.gte('created_at', limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, refreshKey]);

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
        const courseName = event.courses?.name || event.metadata?.courseName;
        if (courseName) {
          courseViews[courseName] = (courseViews[courseName] || 0) + 1;
        }
      } else if (type === 'preview') {
        previews++;
      } else if (type === 'download') {
        const count = 1;
        downloads += count;

        // Resolve exam identifier
        let examLabel = 'Άγνωστο Αρχείο';
        if (event.exams) {
          examLabel = `${event.exams.course} - ${event.exams.year} (${event.exams.period})`;
        } else if (event.metadata?.filename) {
          examLabel = event.metadata.filename;
        }
        examDownloads[examLabel] = (examDownloads[examLabel] || 0) + count;
      } else if (type === 'download_all') {
        const count = event.metadata?.filesCount || 1;
        downloads += count;

        const courseName = event.courses?.name || 'Bulk ZIP';
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

  const recentEvents = useMemo(() => {
    return events.slice(0, 10);
  }, [events]);

  const handleRefresh = () => {
    setRefreshKey(p => p + 1);
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

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* ── Title & Filter Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 0.5 }}>
            Αναλυτικά Στατιστικά
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Παρακολούθηση επισκεψιμότητας, λήψεων και δραστηριότητας χρηστών
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={handleRefresh} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 1 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Χρονικό Εύρος</InputLabel>
            <Select
              value={timeframe}
              label="Χρονικό Εύρος"
              onChange={(e) => setTimeframe(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="24h">Τελευταίο 24ωρο</MenuItem>
              <MenuItem value="7d">Τελευταίες 7 ημέρες</MenuItem>
              <MenuItem value="30d">Τελευταίες 30 ημέρες</MenuItem>
              <MenuItem value="all">Όλα τα δεδομένα</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Φόρτωση στατιστικών...</Typography>
        </Box>
      ) : (
        <>
          {/* ── Section: Website Traffic Frequencies (DAU / WAU / MAU) ── */}
          <Paper sx={{
            p: 3, mb: 4, borderRadius: '20px',
            border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            background: dark ? 'linear-gradient(135deg, #1e2025 0%, #17181c 100%)' : '#fff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
              <PeopleIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                Κίνηση & Επισκεψιμότητα Ιστότοπου
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {/* Daily segment */}
              <Grid item xs={12} sm={4} md={4}>
                <Box sx={{
                  p: 2.5, borderRadius: '14px', bgcolor: dark ? alpha('#1a73e8', 0.04) : alpha('#1a73e8', 0.02),
                  border: '1px solid', borderColor: dark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.08)
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Τελευταίο 24ωρο (Ημερήσια)
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="baseline" sx={{ mt: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                        {trafficStats.day.uv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Μοναδικοί (UV)</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                        {trafficStats.day.pv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Σελίδες (PV)</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Weekly segment */}
              <Grid item xs={12} sm={4} md={4}>
                <Box sx={{
                  p: 2.5, borderRadius: '14px', bgcolor: dark ? alpha('#7b1fa2', 0.04) : alpha('#7b1fa2', 0.02),
                  border: '1px solid', borderColor: dark ? alpha('#7b1fa2', 0.12) : alpha('#7b1fa2', 0.08)
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Τελευταίες 7 Ημέρες (Εβδομαδιαία)
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="baseline" sx={{ mt: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#7b1fa2', lineHeight: 1 }}>
                        {trafficStats.week.uv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Μοναδικοί (UV)</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                        {trafficStats.week.pv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Σελίδες (PV)</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Monthly segment */}
              <Grid item xs={12} sm={4} md={4}>
                <Box sx={{
                  p: 2.5, borderRadius: '14px', bgcolor: dark ? alpha('#2e7d32', 0.04) : alpha('#2e7d32', 0.02),
                  border: '1px solid', borderColor: dark ? alpha('#2e7d32', 0.12) : alpha('#2e7d32', 0.08)
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Τελευταίες 30 Ημέρες (Μηνιαία)
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="baseline" sx={{ mt: 1.5 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#2e7d32', lineHeight: 1 }}>
                        {trafficStats.month.uv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Μοναδικοί (UV)</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                        {trafficStats.month.pv}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Σελίδες (PV)</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── KPI Overview Cards ── */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Pageviews */}
            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
              <Card sx={{ width: '100%', border: '1px solid', borderColor: 'divider', bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main, borderRadius: '10px' }}>
                      <VisibilityIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Προβολές Σελίδων</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>{stats.kpis.views}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Previews */}
            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
              <Card sx={{ width: '100%', border: '1px solid', borderColor: 'divider', bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main, borderRadius: '10px' }}>
                      <ArticleIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Προεπισκοπήσεις</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>{stats.kpis.previews}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Downloads */}
            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
              <Card sx={{ width: '100%', border: '1px solid', borderColor: 'divider', bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main, borderRadius: '10px' }}>
                      <DownloadIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Λήψεις Θεμάτων</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>{stats.kpis.downloads}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Uploads */}
            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
              <Card sx={{ width: '100%', border: '1px solid', borderColor: 'divider', bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.15), color: theme.palette.success.main, borderRadius: '10px' }}>
                      <CloudUploadIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Μεταφορτώσεις</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>{stats.kpis.uploads}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Section: Custom SVG Chart & Trends ── */}
          <Paper sx={{
            p: 3, mb: 4, borderRadius: '20px',
            border: '1px solid', borderColor: 'divider',
            bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff',
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TimelineIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem' }}>
                  Διάγραμμα Τάσεων
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2.5}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Προβολές</Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: 'secondary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Λήψεις</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Custom SVG Line Chart */}
            <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH} style={{ overflow: 'visible' }}>
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
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Top Courses */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Paper sx={{
                width: '100%',
                p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {i + 1}. {c.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
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
                p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                              {i + 1}. {exam.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
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
            p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
            bgcolor: dark ? 'rgba(255,255,255,0.01)' : '#fff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NavigationIcon color="primary" sx={{ transform: 'rotate(90deg)' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
                Πρόσφατη Δραστηριότητα (Live Feed)
              </Typography>
            </Box>
            {recentEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Δεν υπάρχουν πρόσφατα συμβάντα
              </Typography>
            ) : (
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ώρα</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ενέργεια</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Σελίδα/Αρχείο</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ταυτότητα</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEvents.map((e) => {
                      const dt = new Date(e.created_at);
                      const timeStr = dt.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const dateStr = dt.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });

                      // Extract context
                      let details = e.page_path;
                      if (e.event_type === 'download' || e.event_type === 'preview') {
                        if (e.exams) {
                          details = `${e.exams.course} - ${e.exams.year} (${e.exams.period})`;
                        } else if (e.metadata?.filename) {
                          details = e.metadata.filename;
                        }
                      } else if (e.event_type === 'upload') {
                        details = `${e.metadata?.courseName || 'Μάθημα'} - ${e.metadata?.year || ''} (${e.metadata?.period || ''})`;
                      } else if (e.event_type === 'download_all') {
                        details = `ZIP: ${e.courses?.name || 'Όλα τα αρχεία'}`;
                      }

                      return (
                        <TableRow key={e.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{timeStr}</Typography>
                            <Typography variant="caption" color="text.disabled">{dateStr}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={getEventNameGreek(e.event_type)}
                              color={getEventColor(e.event_type)}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: '8px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={details} placement="top">
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{details}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {e.user_id ? (
                              <Chip
                                size="small"
                                label="Admin/User"
                                color="primary"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px', height: 20 }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                label={`Επισκέπτης (${e.visitor_id.substring(0, 5)})`}
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px', height: 20, color: 'text.secondary' }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminAnalytics;
