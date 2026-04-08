import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Alert, Skeleton, TextField, InputAdornment,
  IconButton, Chip, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, useMediaQuery, useTheme, alpha, CircularProgress, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DoneIcon from '@mui/icons-material/Done';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TablePagination from '@mui/material/TablePagination';
import { supabase } from '../../supabaseClient';
import { Capacitor } from '@capacitor/core';
import PdfPreview from '../../components/PdfPreview';

const StatusChip = ({ approved }) => (
  <Chip
    icon={approved
      ? <CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />
      : <HourglassTopIcon sx={{ fontSize: '13px !important' }} />
    }
    label={approved ? 'Εγκεκριμένο' : 'Εκκρεμεί'}
    size="small"
    sx={{
      fontWeight: 700,
      fontSize: '0.7rem',
      borderRadius: '8px',
      background: approved ? alpha('#1e8e3e', 0.12) : alpha('#f57c00', 0.12),
      color: approved ? '#1e8e3e' : '#f57c00',
      border: '1px solid',
      borderColor: approved ? alpha('#1e8e3e', 0.25) : alpha('#f57c00', 0.25),
      '& .MuiChip-icon': { color: 'inherit' },
    }}
  />
);

const ActionBtn = ({ title, onClick, color = '#1a73e8', bg, hoverBg, icon, href, disabled }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const defaultBg = isDark ? alpha(color, 0.15) : alpha(color, 0.1);
  const defaultHoverBg = isDark ? alpha(color, 0.25) : alpha(color, 0.18);
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          size="small"
          href={href}
          target={href ? '_blank' : undefined}
          rel={href ? 'noopener noreferrer' : undefined}
          onClick={!href ? onClick : undefined}
          disabled={disabled}
          sx={{
            width: 34, height: 34, borderRadius: '10px',
            background: bg || defaultBg,
            color: color,
            transition: 'all 0.18s ease',
            '&:hover': { background: hoverBg || defaultHoverBg, transform: 'scale(1.08)' },
            '&:disabled': { opacity: 0.4 },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const ExamCard = ({ exam, users, onApprove, onPreview, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      p: 2.5, borderRadius: '16px',
      background: isDark ? alpha('#fff', 0.04) : '#ffffff',
      border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.3, lineHeight: 1.3 }}>
            {exam.course}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{exam.year}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{exam.period}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonOutlineIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {users[exam.uploader] || 'Άγνωστος'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <StatusChip approved={exam.approved} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        {!exam.approved && (
          <ActionBtn
            title="Έγκριση"
            onClick={() => onApprove(exam.id)}
            color="#1e8e3e"
            icon={<DoneIcon sx={{ fontSize: 16 }} />}
          />
        )}
        <ActionBtn
          title="Προβολή"
          onClick={() => onPreview(exam)}
          color="#1a73e8"
          icon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
        />
        <ActionBtn
          title="Λήψη"
          href={exam.file_url}
          color="#7b1fa2"
          icon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
        />
        <ActionBtn
          title="Διαγραφή"
          onClick={() => onDelete(exam.id, exam.file_url)}
          color="#d32f2f"
          icon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
        />
      </Box>
    </Box>
  );
};

const AdminFiles = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, file_url: null });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));

  const cardBg = {
    background: isDark ? alpha('#fff', 0.04) : '#ffffff',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    borderRadius: '16px',
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
  };

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setExams(data);
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

  useEffect(() => {
    const uploaderIds = [...new Set(exams.map(e => e.uploader).filter(Boolean))];
    if (!uploaderIds.length) return;
    supabase.from('profiles').select('id,first_name,last_name,email').in('id', uploaderIds).then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(u => {
          map[u.id] = (u.first_name || u.last_name)
            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
            : (u.email || u.id);
        });
        setUsers(map);
      }
    });
  }, [exams]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Εγκρίθηκε!'); fetchExams(); }
    setApprovingId(null);
  };

  const handleDelete = async (id, file_url) => {
    setError(''); setSuccess('');
    const filePath = file_url.split('/exams/')[1];
    if (filePath) await supabase.storage.from('exams').remove([filePath]);
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Διαγράφηκε!'); fetchExams(); }
    setConfirmDelete({ open: false, id: null, file_url: null });
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !search || (() => {
      const s = search.toLowerCase();
      return (
        (exam.title && exam.title.toLowerCase().includes(s)) ||
        (exam.course && exam.course.toLowerCase().includes(s)) ||
        (exam.period && exam.period.toLowerCase().includes(s)) ||
        (exam.year && String(exam.year).includes(s))
      );
    })();
    const matchesTab = tab === 0 ? !exam.approved : exam.approved;
    return matchesSearch && matchesTab;
  });

  const paginated = filteredExams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pendingCount = exams.filter(e => !e.approved).length;
  const approvedCount = exams.filter(e => e.approved).length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(26,115,232,0.35)',
          }}>
            <FolderOpenIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
              Διαχείριση Αρχείων
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
              Έγκριση και διαχείριση εξετάσεων
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filter Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Αναζήτηση αρχείου..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', background: isDark ? alpha('#fff', 0.05) : '#fff' },
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`Εκκρεμή (${pendingCount})`}
            onClick={() => { setTab(0); setPage(0); }}
            icon={<HourglassTopIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              fontWeight: 700, fontSize: '0.78rem', borderRadius: '10px', cursor: 'pointer',
              background: tab === 0 ? alpha('#f57c00', 0.15) : 'transparent',
              border: '1px solid', borderColor: tab === 0 ? alpha('#f57c00', 0.3) : 'divider',
              color: tab === 0 ? '#f57c00' : 'text.secondary',
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
          <Chip
            label={`Εγκεκριμένα (${approvedCount})`}
            onClick={() => { setTab(1); setPage(0); }}
            icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              fontWeight: 700, fontSize: '0.78rem', borderRadius: '10px', cursor: 'pointer',
              background: tab === 1 ? alpha('#1e8e3e', 0.15) : 'transparent',
              border: '1px solid', borderColor: tab === 1 ? alpha('#1e8e3e', 0.3) : 'divider',
              color: tab === 1 ? '#1e8e3e' : 'text.secondary',
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        </Box>
      </Box>

      {/* Data */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ ...cardBg, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="50%" height={22} />
                  <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={80} height={24} sx={{ borderRadius: '8px' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[...Array(3)].map((_, j) => <Skeleton key={j} variant="rounded" width={34} height={34} sx={{ borderRadius: '10px' }} />)}
              </Box>
            </Box>
          ))}
        </Box>
      ) : paginated.length === 0 ? (
        <Box sx={{ ...cardBg, py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <FolderOpenIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {tab === 0 ? 'Δεν υπάρχουν εκκρεμή αρχεία' : 'Δεν υπάρχουν εγκεκριμένα αρχεία'}
          </Typography>
        </Box>
      ) : (
        <>
          {isMobileScreen ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {paginated.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  users={users}
                  onApprove={handleApprove}
                  onPreview={(e) => { setPreviewFile(e); setPreviewOpen(true); }}
                  onDelete={(id, url) => setConfirmDelete({ open: true, id, file_url: url })}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ ...cardBg, overflow: 'hidden' }}>
              {/* Table header */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 140px 140px 100px 130px',
                px: 3, py: 1.5,
                background: isDark ? alpha('#fff', 0.03) : alpha('#1a73e8', 0.04),
                borderBottom: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              }}>
                {['Μάθημα', 'Έτος', 'Εξεταστική', 'Uploader', 'Status', 'Ενέργειες'].map(h => (
                  <Typography key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {paginated.map((exam, idx) => (
                <Box
                  key={exam.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 140px 140px 100px 130px',
                    px: 3, py: 2,
                    alignItems: 'center',
                    borderBottom: idx < paginated.length - 1 ? '1px solid' : 'none',
                    borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    transition: 'background 0.15s',
                    '&:hover': { background: isDark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.02) },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.course}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{exam.year}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{exam.period}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {users[exam.uploader] || '—'}
                  </Typography>
                  <Box><StatusChip approved={exam.approved} /></Box>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {!exam.approved && (
                      <ActionBtn
                        title="Έγκριση"
                        onClick={() => handleApprove(exam.id)}
                        color="#1e8e3e"
                        disabled={approvingId === exam.id}
                        icon={approvingId === exam.id ? <CircularProgress size={14} /> : <DoneIcon sx={{ fontSize: 15 }} />}
                      />
                    )}
                    <ActionBtn
                      title="Προβολή"
                      onClick={() => { setPreviewFile(exam); setPreviewOpen(true); }}
                      color="#1a73e8"
                      icon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                    />
                    <ActionBtn
                      title="Λήψη"
                      href={exam.file_url}
                      color="#7b1fa2"
                      icon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
                    />
                    <ActionBtn
                      title="Διαγραφή"
                      onClick={() => setConfirmDelete({ open: true, id: exam.id, file_url: exam.file_url })}
                      color="#d32f2f"
                      icon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <TablePagination
            component="div"
            count={filteredExams.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 1, '& .MuiTablePagination-toolbar': { fontWeight: 500, fontSize: '0.8rem' } }}
          />
        </>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, file_url: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e1f23' : '#fff',
            border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το αρχείο; Η ενέργεια δεν αναστρέφεται.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDelete({ open: false, id: null, file_url: null })} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1 }}>
            Ακύρωση
          </Button>
          <Button
            onClick={() => handleDelete(confirmDelete.id, confirmDelete.file_url)}
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flex: 1 }}
          >
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewFile(null); }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1a1b1e' : '#fff',
            border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            height: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              {previewFile?.course}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {previewFile?.period} {previewFile?.year}
            </Typography>
          </Box>
          <IconButton
            onClick={() => { setPreviewOpen(false); setPreviewFile(null); }}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {previewFile && (
            <Box sx={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
              {previewFile.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <Box
                  component="img"
                  src={previewFile.file_url}
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', mx: 'auto' }}
                />
              ) : previewFile.file_url?.match(/\.pdf$/i) ? (
                (isMobileScreen || Capacitor.isNativePlatform()) ? (
                  <PdfPreview fileUrl={previewFile.file_url} showAllPages={true} />
                ) : (
                  <Box
                    component="iframe"
                    src={`${previewFile.file_url}#toolbar=0`}
                    sx={{ width: '100%', height: '100%', border: 'none' }}
                  />
                )
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.4 }} />
                  <Typography sx={{ color: 'text.secondary' }}>Δεν υποστηρίζεται προεπισκόπηση</Typography>
                  <Button variant="contained" href={previewFile.file_url} target="_blank" sx={{ borderRadius: '10px', textTransform: 'none' }}>
                    Λήψη Αρχείου
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminFiles;