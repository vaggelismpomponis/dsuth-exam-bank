import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, IconButton, Chip, Alert, Stack,
    useTheme, useMediaQuery, Card, CardContent, Grid, Button,
    Divider, Tooltip, alpha, Skeleton, Avatar,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MessageIcon from '@mui/icons-material/Message';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { supabase } from '../../supabaseClient';

const PageHeader = ({ title, subtitle, icon, count }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    return (
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 44, height: 44, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(26,115,232,0.35)',
                }}>
                    {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 22 } })}
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>{subtitle}</Typography>
                </Box>
            </Box>
            {count !== undefined && (
                <Chip
                    label={`${count} αιτήσεις`}
                    sx={{
                        fontWeight: 700,
                        background: isDark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
                        color: 'primary.main', border: '1px solid', borderColor: alpha('#1a73e8', 0.2), borderRadius: '10px',
                    }}
                />
            )}
        </Box>
    );
};

const AdminApplications = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const fetchRows = async () => {
        setLoading(true);
        setError('');
        const { data, error } = await supabase
            .from('admin_applications')
            .select('id,user_id,email,name,message,status,created_at')
            .order('created_at', { ascending: false });
        if (error) setError(error.message);
        else setRows(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchRows(); }, []);

    const handleApprove = async (id, userId) => {
        if (!window.confirm('Σίγουρα θέλεις να εγκρίνεις αυτή την αίτηση; Ο χρήστης θα γίνει Admin.')) return;
        setError(''); setSuccess('');
        const { error: appError } = await supabase.from('admin_applications').update({ status: 'approved' }).eq('id', id);
        if (appError) { setError('Σφάλμα: ' + appError.message); return; }
        const { error: profileError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        if (profileError) { setError('Σφάλμα (profile): ' + profileError.message); return; }
        setSuccess('Ο χρήστης εγκρίθηκε και έγινε Admin!');
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    };

    const handleReject = async (id) => {
        if (!window.confirm('Σίγουρα θέλεις να απορρίψεις αυτή την αίτηση;')) return;
        setError(''); setSuccess('');
        const { error } = await supabase.from('admin_applications').update({ status: 'rejected' }).eq('id', id);
        if (error) { setError('Σφάλμα: ' + error.message); return; }
        setSuccess('Η αίτηση απορρίφθηκε.');
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Σίγουρα θέλεις να διαγράψεις αυτή την αίτηση;')) return;
        setError(''); setSuccess('');
        const { error } = await supabase.from('admin_applications').delete().eq('id', id);
        if (error) setError(error.message);
        else {
            setSuccess('Η αίτηση διαγράφηκε!');
            setRows((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved': return <Chip label="Εγκρίθηκε" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', background: alpha('#1e8e3e', 0.12), color: '#1e8e3e', border: '1px solid', borderColor: alpha('#1e8e3e', 0.2) }} />;
            case 'rejected': return <Chip label="Απορρίφθηκε" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', background: alpha('#d32f2f', 0.12), color: '#d32f2f', border: '1px solid', borderColor: alpha('#d32f2f', 0.2) }} />;
            default: return <Chip label="Εκκρεμεί" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', background: alpha('#f57c00', 0.12), color: '#f57c00', border: '1px solid', borderColor: alpha('#f57c00', 0.2) }} />;
        }
    };

    const cardStyle = {
        p: 3, borderRadius: '16px',
        background: isDark ? alpha('#fff', 0.04) : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        },
    };

    return (
        <Box sx={{ width: '100%' }}>
            <PageHeader
                title="Αιτήσεις Admin"
                subtitle="Διαχείριση αιτήσεων από χρήστες για δικαιώματα διαχειριστή"
                icon={<AssignmentIndIcon />}
                count={loading ? undefined : rows.length}
            />

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Stack spacing={2}>
                    {[...Array(3)].map((_, i) => (
                        <Box key={i} sx={{ ...cardStyle }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                                <Skeleton variant="circular" width={44} height={44} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="40%" height={20} />
                                    <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
                                </Box>
                            </Box>
                            <Skeleton width="100%" height={80} sx={{ borderRadius: '12px' }} />
                        </Box>
                    ))}
                </Stack>
            ) : rows.length === 0 ? (
                <Box sx={{ ...cardStyle, py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <AssignmentIndIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3 }} />
                    <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Δεν υπάρχουν αιτήσεις Admin</Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {rows.map((r) => (
                        <Box key={r.id} sx={cardStyle}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 44, height: 44,
                                            background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                                            fontSize: '0.875rem', fontWeight: 700,
                                            boxShadow: '0 2px 8px rgba(26,115,232,0.25)',
                                        }}
                                    >
                                        {r.name?.[0]?.toUpperCase() || 'U'}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                                            {r.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <EmailOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{r.email}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                                                    {new Date(r.created_at).toLocaleDateString('el-GR')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                {getStatusChip(r.status)}
                            </Box>

                            <Box sx={{
                                p: 2, borderRadius: '12px', mb: 2.5,
                                background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                border: '1px solid', borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <MessageIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, display: 'block' }}>
                                            Μήνυμα/Λόγος Αίτησης
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.primary', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                            {r.message || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Δεν υπάρχει μήνυμα</span>}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                                {r.status === 'pending' && (
                                    <>
                                        <Tooltip title="Έγκριση" arrow>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handleApprove(r.id, r.user_id)}
                                                startIcon={<CheckCircleOutlineIcon />}
                                                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 2 }}
                                            >
                                                Έγκριση
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Απόρριψη" arrow>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                size="small"
                                                onClick={() => handleReject(r.id)}
                                                startIcon={<CancelOutlinedIcon />}
                                                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2 }}
                                            >
                                                Απόρριψη
                                            </Button>
                                        </Tooltip>
                                    </>
                                )}
                                <Tooltip title="Διαγραφή Αίτησης" arrow>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDelete(r.id)}
                                        startIcon={<DeleteOutlineIcon />}
                                        sx={{
                                            borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2,
                                            borderColor: alpha('#d32f2f', 0.3),
                                            '&:hover': { background: alpha('#d32f2f', 0.05), borderColor: '#d32f2f' },
                                        }}
                                    >
                                        Διαγραφή
                                    </Button>
                                </Tooltip>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default AdminApplications;
