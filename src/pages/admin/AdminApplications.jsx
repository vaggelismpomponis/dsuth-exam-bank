import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Alert,
    Stack,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Grid,
    Button,
    Divider,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { supabase } from '../../supabaseClient';

const AdminApplications = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const theme = useTheme();
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

    useEffect(() => {
        fetchRows();
    }, []);

    const handleApprove = async (id, userId) => {
        setError('');
        setSuccess('');

        // 1. Update application status
        const { error: appError } = await supabase
            .from('admin_applications')
            .update({ status: 'approved' })
            .eq('id', id);

        if (appError) {
            setError('Σφάλμα κατά την έγκριση (application): ' + appError.message);
            return;
        }

        // 2. Update user profile role to admin
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (profileError) {
            setError('Σφάλμα κατά την έγκριση (profile): ' + profileError.message);
            return;
        }

        setSuccess('Ο χρήστης εγκρίθηκε και έγινε Admin!');
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    };

    const handleReject = async (id) => {
        setError('');
        setSuccess('');
        const { error } = await supabase
            .from('admin_applications')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) {
            setError('Σφάλμα κατά την απόρριψη: ' + error.message);
            return;
        }

        setSuccess('Η αίτηση απορρίφθηκε.');
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
    };

    const handleDelete = async (id) => {
        setError('');
        setSuccess('');
        const { error } = await supabase.from('admin_applications').delete().eq('id', id);
        if (error) setError(error.message);
        else {
            setSuccess('Διαγραφή αίτησης επιτυχής');
            setRows((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved': return <Chip label="Εγκρίθηκε" color="success" size="small" sx={{ fontWeight: 700 }} />;
            case 'rejected': return <Chip label="Απορρίφθηκε" color="error" size="small" sx={{ fontWeight: 700 }} />;
            default: return <Chip label="Εκκρεμεί" color="warning" size="small" sx={{ fontWeight: 700 }} />;
        }
    };

    return (
        <Box sx={{ mt: 4, mb: 4, width: '100%' }}>
            <Typography variant="h4" color={theme.palette.mode === 'light' ? '#111' : 'text.primary'} fontWeight={700} gutterBottom align="left">
                ΑΙΤΗΣΕΙΣ ADMIN
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {isMobile ? (
                <Stack spacing={2}>
                    {(rows || []).map((r) => (
                        <Card key={r.id} sx={{
                            borderRadius: '16px',
                            border: `1px solid ${theme.palette.mode === 'light' ? '#e3eafc' : 'rgba(255,255,255,0.05)'}`,
                            background: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
                            boxShadow: theme.palette.mode === 'light' ? '0 2px 8px 0 rgba(31,38,135,0.05)' : '0 4px 12px 0 rgba(0,0,0,0.3)',
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-start' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                        {r.name}
                                    </Typography>
                                    {getStatusChip(r.status)}
                                </Box>

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2">{r.email}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Ημ/νία</Typography>
                                        <Typography variant="body2">{new Date(r.created_at).toLocaleDateString('el-GR')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Μήνυμα/Λόγος</Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', p: 1.5, bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                            {r.message}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 1.5 }} />

                                <Stack direction="row" spacing={1.5} justifyContent="flex-start" sx={{ pt: 0.5 }}>
                                    {r.status === 'pending' && (
                                        <>
                                            <Tooltip title="Έγκριση">
                                                <Button
                                                    color="success"
                                                    onClick={() => handleApprove(r.id, r.user_id)}
                                                    sx={{
                                                        minWidth: 44, height: 44, p: 0, borderRadius: 2,
                                                        background: theme.palette.mode === 'light' ? '#e8f5e9' : 'rgba(76, 175, 80, 0.12)',
                                                        '&:hover': { background: theme.palette.mode === 'light' ? '#c8e6c9' : 'rgba(76, 175, 80, 0.25)' }
                                                    }}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Απόρριψη">
                                                <Button
                                                    color="warning"
                                                    onClick={() => handleReject(r.id)}
                                                    sx={{
                                                        minWidth: 44, height: 44, p: 0, borderRadius: 2,
                                                        background: theme.palette.mode === 'light' ? '#fff3e0' : 'rgba(255, 152, 0, 0.12)',
                                                        '&:hover': { background: theme.palette.mode === 'light' ? '#ffe0b2' : 'rgba(255, 152, 0, 0.25)' }
                                                    }}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </Button>
                                            </Tooltip>
                                        </>
                                    )}
                                    <Tooltip title="Διαγραφή">
                                        <Button
                                            color="error"
                                            onClick={() => handleDelete(r.id)}
                                            sx={{
                                                minWidth: 44, height: 44, p: 0, borderRadius: 2,
                                                background: theme.palette.mode === 'light' ? '#ffebee' : 'rgba(244, 67, 54, 0.12)',
                                                '&:hover': { background: theme.palette.mode === 'light' ? '#ffcdd2' : 'rgba(244, 67, 54, 0.25)' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <TableContainer component={Paper} sx={{
                    background: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
                    boxShadow: theme.palette.mode === 'light' ? '0 2px 12px 0 rgba(31,38,135,0.08)' : '0 4px 20px 0 rgba(0,0,0,0.4)',
                    borderRadius: '18px',
                    border: `1px solid ${theme.palette.mode === 'light' ? '#e3eafc' : 'rgba(255,255,255,0.05)'}`,
                }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: theme.palette.mode === 'light' ? '#f4f6fa' : 'background.default' }}>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Όνομα</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16, width: 400 }}>Μήνυμα</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Κατάσταση</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Ημ/νία</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16, textAlign: 'center' }}>Ενέργειες</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rows || []).map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.name}</TableCell>
                                    <TableCell>{r.email}</TableCell>
                                    <TableCell sx={{ maxWidth: 400, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem' }}>{r.message}</TableCell>
                                    <TableCell>{getStatusChip(r.status)}</TableCell>
                                    <TableCell>{new Date(r.created_at).toLocaleDateString('el-GR')}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {r.status === 'pending' && (
                                                <>
                                                    <IconButton color="success" onClick={() => handleApprove(r.id, r.user_id)} size="small" title="Έγκριση">
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                    <IconButton color="warning" onClick={() => handleReject(r.id)} size="small" title="Απόρριψη">
                                                        <CancelIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                            <IconButton color="error" onClick={() => handleDelete(r.id)} size="small" title="Διαγραφή">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {!rows?.length && !loading && (
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>Δεν υπάρχουν αιτήσεις.</Typography>
            )}
            {loading && (
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>Φόρτωση...</Typography>
            )}
        </Box>
    );
};

export default AdminApplications;
