import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, IconButton, Tooltip, CircularProgress,
    Snackbar, Alert, useTheme, useMediaQuery, Stack, alpha,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Capacitor } from '@capacitor/core';
import { downloadFile, shareFile } from '../utils/nativeDownload';
import PdfPreview from '../components/PdfPreview';
import { clearCacheAndReload } from '../lib/cacheUtils';
import { normalizeFileUrl } from '../lib/urlNormalizer';

const FileViewer = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');

    const fileUrl = normalizeFileUrl(searchParams.get('url') || '');
    const fileName = searchParams.get('name') || 'Αρχείο';
    const courseName = searchParams.get('course') || '';
    const period = searchParams.get('period') || '';
    const year = searchParams.get('year') || '';

    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [numPages, setNumPages] = useState(null);
    const [loadError, setLoadError] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const handlePreviewError = useCallback(() => {
        setLoadError(true);
    }, []);

    useEffect(() => {
        setLoading(true);
        setLoadError(false);
    }, [fileUrl]);

    const showNotification = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDownload = async () => {
        try {
            showNotification('Γίνεται λήψη...', 'info');
            await downloadFile(fileUrl, getFilenameFromUrl(fileUrl));
            showNotification('Αρχείο αποθηκεύτηκε στα Έγγραφα!', 'success');
        } catch (e) {
            showNotification('Αποτυχία λήψης αρχείου', 'error');
        }
    };

    const handleShare = async () => {
        try {
            const response = await fetch(fileUrl, { mode: 'cors' });
            const blob = await response.blob();
            await shareFile(blob, getFilenameFromUrl(fileUrl));
        } catch (e) {
            showNotification('Αποτυχία κοινοποίησης', 'error');
        }
    };

    const handleOpenExternal = () => {
        window.open(fileUrl, '_blank');
    };

    const getFilenameFromUrl = (url) => url.split('/').pop().split('?')[0];

    const ext = getFilenameFromUrl(fileUrl).split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
    const isPdf = ext === 'pdf';

    const subtitle = [courseName, period, year].filter(Boolean).join(' · ');

    return (
        <Box sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1300,
            bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Top App Bar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : '#2d2e30',
                    color: 'text.primary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    pt: 'env(safe-area-inset-top, 0px)',
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
                    <IconButton
                        edge="start"
                        onClick={() => navigate(-1)}
                        sx={{ mr: 1, color: 'text.primary' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{ fontWeight: 700, lineHeight: 1.2 }}
                        >
                            {fileName}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Λήψη">
                            <IconButton onClick={handleDownload} sx={{ color: 'primary.main' }}>
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Κοινοποίηση">
                            <IconButton onClick={handleShare} sx={{ color: 'primary.main' }}>
                                <ShareIcon />
                            </IconButton>
                        </Tooltip>
                        {!isMobile && (
                            <Tooltip title="Άνοιγμα σε νέα καρτέλα">
                                <IconButton onClick={handleOpenExternal} sx={{ color: 'text.secondary' }}>
                                    <OpenInNewIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* File Content Area */}
            <Box sx={{ flex: 1, position: 'relative', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {loading && (
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">Φόρτωση αρχείου...</Typography>
                    </Box>
                )}

                {isImage ? (
                    <Box sx={{
                        width: '100%', minHeight: '100%',
                        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                        p: 1,
                    }}>
                        <Box
                            component="img"
                            src={fileUrl}
                            alt={fileName}
                            onLoad={() => setLoading(false)}
                            onError={handlePreviewError}
                            sx={{
                                width: '100%',
                                maxWidth: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: 1,
                                display: loading ? 'none' : 'block',
                            }}
                        />
                    </Box>
                ) : isPdf && (isMobile || Capacitor.isNativePlatform()) ? (
                    <Box sx={{ width: '100%', height: 'calc(100vh - 56px)' }}>
                        <PdfPreview fileUrl={fileUrl} showAllPages={true} onLoadError={handlePreviewError} />
                    </Box>
                ) : (
                    <Box
                        component="iframe"
                        src={Capacitor.isNativePlatform()
                            ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`
                            : `${fileUrl}#toolbar=0&navpanes=0&zoom=page-fit`
                        }
                        onLoad={() => setLoading(false)}
                        onError={handlePreviewError}
                        sx={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: loading ? 'none' : 'block',
                        }}
                    />
                )}
            </Box>

            {/* Snackbar Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: 2 }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    sx={{ borderRadius: 3, fontWeight: 500 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Dialog for loading error */}
            <Dialog
                open={loadError}
                onClose={() => setLoadError(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 1.5,
                        maxWidth: '400px',
                        background: theme.palette.mode === 'dark' ? '#1e1f23' : '#fff',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, color: 'text.primary' }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: theme.palette.mode === 'dark' ? alpha('#d93025', 0.18) : alpha('#d93025', 0.1),
                        color: '#d93025', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <ErrorOutlineIcon />
                    </Box>
                    Σφάλμα φόρτωσης
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.4 }}>
                        Δεν ήταν δυνατή η φόρτωση του αρχείου. Παρακαλώ ανανεώστε τη σελίδα και δοκιμάστε ξανά.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setLoadError(false)} 
                        variant="outlined" 
                        sx={{ borderRadius: 100, textTransform: 'none', px: 2.5 }}
                    >
                        Κλείσιμο
                    </Button>
                    <Button 
                        onClick={clearCacheAndReload} 
                        variant="contained" 
                        startIcon={<RefreshIcon />}
                        sx={{ borderRadius: 100, textTransform: 'none', px: 2.5 }}
                    >
                        Ανανέωση
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FileViewer;
