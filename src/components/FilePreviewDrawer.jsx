import React, { useState, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton, Tooltip, Chip, Stack,
  useTheme, useMediaQuery, alpha, CircularProgress, Divider, Button,
  Snackbar, Alert, Dialog,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import DoneIcon from '@mui/icons-material/Done';
import { Capacitor } from '@capacitor/core';
import { downloadFile, shareFile } from '../utils/nativeDownload';
import PdfPreview from './PdfPreview';
import { trackEvent } from '../lib/analytics';

/* ─── helpers ─── */
const getExt = (url = '') => url.split('/').pop().split('?')[0].split('.').pop().toLowerCase();
const getFilename = (url = '') => url.split('/').pop().split('?')[0];

/* ─── small action button ─── */
const ActionBtn = ({ title, onClick, href, icon, color, disabled, loading: isLoading }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  return (
    <Tooltip title={title} arrow disableInteractive>
      <span>
        <IconButton
          size="small"
          disabled={disabled || isLoading}
          href={href || undefined}
          target={href ? '_blank' : undefined}
          rel={href ? 'noopener noreferrer' : undefined}
          onClick={!href ? onClick : undefined}
          sx={{
            width: 38, height: 38, borderRadius: '11px',
            background: dark ? alpha(color, 0.14) : alpha(color, 0.09),
            color,
            transition: 'all 0.16s ease',
            '&:hover': { background: dark ? alpha(color, 0.24) : alpha(color, 0.16), transform: 'scale(1.07)' },
            '&:disabled': { opacity: 0.4 },
          }}
        >
          {isLoading ? <CircularProgress size={16} sx={{ color }} /> : icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

/* ─── metadata pill ─── */
const MetaPill = ({ icon, label }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1.25, py: 0.45, borderRadius: '8px',
      background: dark ? alpha('#fff', 0.06) : alpha('#1a73e8', 0.07),
      border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.08)' : alpha('#1a73e8', 0.15),
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 13, color: 'primary.main' } })}
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
    </Box>
  );
};

/*
 * FilePreviewDrawer
 *
 * Props:
 *   open          – boolean
 *   onClose       – () => void
 *   file          – { file_url, course, period, year, approved }
 *   uploader      – string (display name)
 *   isAdmin       – boolean  – show approve / delete buttons
 *   approvingId   – id being approved (to show spinner)
 *   onApprove     – (id) => void
 *   onDelete      – (id, url) => void  – triggers parent's confirm dialog
 *
 * Behaviour:
 *   desktop (md+)  → centered Dialog modal
 *   mobile/tablet  → bottom-sheet Drawer
 */
const FilePreviewDrawer = ({
  open, onClose, file,
  uploader,
  isAdmin = false,
  approvingId = null,
  onApprove,
  onDelete,
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dlLoading, setDlLoading] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const url = file?.file_url ? file.file_url.trim().replace(/\?$/, '') : '';
  const ext = getExt(url);
  const filename = getFilename(url);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
  const isPdf = ext === 'pdf';

  const subtitle = [file?.course, file?.period, file?.year ? String(file.year) : ''].filter(Boolean).join(' · ');

  const handleDownload = useCallback(async () => {
    if (!url) return;
    setDlLoading(true);
    try {
      notify('Γίνεται λήψη...', 'info');
      await downloadFile(url, filename);
      notify('Αρχείο αποθηκεύτηκε!', 'success');
      // Track download from drawer
      trackEvent('download', { courseId: file?.courseId, examId: file?.id, filename });
    } catch {
      notify('Αποτυχία λήψης!', 'error');
    } finally {
      setDlLoading(false);
    }
  }, [url, filename, file]);

  const handleShare = useCallback(async () => {
    if (!url) return;
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      await shareFile(blob, filename);
    } catch {
      notify('Αποτυχία κοινοποίησης!', 'error');
    }
  }, [url, filename]);

  /* ── shared inner content (used by both Dialog & Drawer) ── */
  const innerContent = (isBottomSheet = false) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <Box sx={{
        px: 2.5, pt: isBottomSheet ? 2 : 2.5, pb: 2,
        borderBottom: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}>
        {isBottomSheet && (
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', mx: 'auto', mb: 2 }} />
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '13px', flexShrink: 0,
            background: isPdf
              ? (dark ? alpha('#d32f2f', 0.18) : alpha('#d32f2f', 0.1))
              : isImage
                ? (dark ? alpha('#1e8e3e', 0.18) : alpha('#1e8e3e', 0.1))
                : (dark ? alpha('#1a73e8', 0.18) : alpha('#1a73e8', 0.1)),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <InsertDriveFileOutlinedIcon sx={{
              fontSize: 22,
              color: isPdf ? '#d32f2f' : isImage ? '#1e8e3e' : 'primary.main',
            }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, wordBreak: 'break-all' }}>
              {filename || 'Αρχείο'}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary', flexShrink: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {file?.course && <MetaPill icon={<SchoolOutlinedIcon />} label={file.course} />}
          {file?.year && <MetaPill icon={<CalendarTodayOutlinedIcon />} label={String(file.year)} />}
          {file?.period && <MetaPill icon={<InsertDriveFileOutlinedIcon />} label={file.period} />}
          <Chip
            size="small"
            icon={file?.approved
              ? <CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />
              : <HourglassTopIcon sx={{ fontSize: '13px !important' }} />}
            label={file?.approved ? 'Εγκεκριμένο' : 'Εκκρεμεί'}
            sx={{
              fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px',
              background: file?.approved ? alpha('#1e8e3e', 0.12) : alpha('#f57c00', 0.12),
              color: file?.approved ? '#1e8e3e' : '#f57c00',
              border: '1px solid',
              borderColor: file?.approved ? alpha('#1e8e3e', 0.25) : alpha('#f57c00', 0.25),
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        </Stack>
      </Box>

      {/* ── Preview area ── */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', bgcolor: dark ? '#111' : '#f0f2f5' }}>
        {!url ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.25 }} />
            <Typography sx={{ color: 'text.secondary' }}>Δεν υπάρχει αρχείο</Typography>
          </Box>
        ) : isImage ? (
          <Box sx={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: 2 }}>
            <Box
              component="img"
              src={url}
              alt={filename}
              onLoad={() => setPreviewLoaded(true)}
              sx={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: dark ? '0 8px 32px rgba(0,0,0,.6)' : '0 8px 32px rgba(0,0,0,.12)', display: previewLoaded ? 'block' : 'none' }}
            />
            {!previewLoaded && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        ) : isPdf ? (
          (isMobile || Capacitor.isNativePlatform()) ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              <PdfPreview fileUrl={url} showAllPages />
            </Box>
          ) : (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              {!previewLoaded && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 1 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">Φόρτωση PDF...</Typography>
                </Box>
              )}
              <Box
                component="iframe"
                src={`${url}#toolbar=0&navpanes=0&zoom=page-fit`}
                onLoad={() => setPreviewLoaded(true)}
                sx={{ width: '100%', height: '100%', border: 'none', display: previewLoaded ? 'block' : 'none' }}
              />
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2, p: 3 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '18px',
              background: dark ? alpha('#1a73e8', 0.14) : alpha('#1a73e8', 0.09),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
              Δεν υποστηρίζεται προεπισκόπηση
            </Typography>
            <Typography sx={{ fontSize: '0.83rem', color: 'text.secondary', textAlign: 'center' }}>
              Κατεβάστε το αρχείο για να το ανοίξετε στη συσκευή σας
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={dlLoading}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, mt: 1 }}
            >
              Λήψη αρχείου
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Action bar ── */}
      <Box sx={{
        px: 2.5, py: 2,
        borderTop: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
        background: dark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.02),
      }}>
        <ActionBtn
          title="Λήψη"
          onClick={handleDownload}
          icon={<DownloadIcon sx={{ fontSize: 18 }} />}
          color="#7b1fa2"
          loading={dlLoading}
        />
        <ActionBtn
          title="Κοινοποίηση"
          onClick={handleShare}
          icon={<ShareIcon sx={{ fontSize: 18 }} />}
          color="#1a73e8"
        />
        {!isMobile && (
          <ActionBtn
            title="Άνοιγμα σε νέα καρτέλα"
            href={url}
            icon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
            color="#0d47a1"
          />
        )}

        {isAdmin && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            {!file?.approved && (
              <ActionBtn
                title="Έγκριση"
                onClick={() => onApprove?.(file?.id)}
                icon={<DoneIcon sx={{ fontSize: 18 }} />}
                color="#1e8e3e"
                disabled={approvingId === file?.id}
                loading={approvingId === file?.id}
              />
            )}
            <ActionBtn
              title="Διαγραφή"
              onClick={() => onDelete?.(file?.id, file?.file_url)}
              icon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
              color="#d32f2f"
            />
          </>
        )}

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}>
          {ext.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );

  const paperBg = {
    background: dark ? '#1e1f23' : '#fff',
    border: '1px solid',
    borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
  };

  return (
    <>
      {/* ── Desktop (md+): centered Dialog ── */}
      {isDesktop ? (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth={false}
          disableScrollLock
          PaperProps={{
            sx: {
              width: 860,
              maxWidth: '92vw',
              height: '82vh',
              maxHeight: '92vh',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              ...paperBg,
            },
          }}
        >
          {innerContent(false)}
        </Dialog>
      ) : (
        /* ── Mobile / Tablet: bottom-sheet Drawer ── */
        <Drawer
          anchor="bottom"
          open={open}
          onClose={onClose}
          ModalProps={{ disableScrollLock: true }}
          PaperProps={{
            sx: {
              width: '100%',
              maxHeight: '92dvh',
              height: '92dvh',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ...paperBg,
            },
          }}
        >
          {innerContent(true)}
        </Drawer>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 10, md: 2 } }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '14px', fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FilePreviewDrawer;
