import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Avatar, TextField, InputAdornment, IconButton, Tooltip, Skeleton, Paper, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const StudentsDirectory = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        // Ensure the user is authenticated
        supabase.auth.getSession().then(({ data, error }) => {
            if (error || !data.session) {
                navigate('/login');
                return;
            }
            fetchStudents();
        });

        const fetchStudents = async () => {
            // Fetch users who are students and have not opted out of the directory
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, role, show_in_directory')
                .eq('role', 'student')
                .neq('show_in_directory', false);

            if (!ignore) {
                if (!error && data) {
                    // Since emails and avatars are in user_metadata which isn't available publicly via the 'profiles' table without an RPC or complex sync,
                    // we actually need to get the emails. Wait, Supabase `auth.users` is not accessible to public via the API directly.
                    // In a real app with strict RLS, getting another user's email requires an RPC or saving it to the public profiles table.
                    // Let's assume the user's email was synced to the profiles table, or we will just display names for now.
                    // However, we want to email them. 

                    setStudents(data);
                }
                setLoading(false);
            }
        };

        return () => { ignore = true; };
    }, [navigate]);

    const filteredStudents = students.filter(student => {
        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', py: { xs: 2, md: 5 }, px: 2, pb: { xs: 12, md: 5 } }}>
            <Container maxWidth="lg" disableGutters>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', px: { xs: 1, sm: 0 } }}>
                    Κατάλογος Φοιτητών
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, px: { xs: 1, sm: 0 } }}>
                    Βρείτε και επικοινωνήστε με άλλους φοιτητές.
                </Typography>

                <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Αναζήτηση με όνομα..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'background.default' }
                        }}
                    />
                </Paper>

                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredStudents.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            Δεν βρέθηκαν φοιτητές με αυτό το όνομα.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredStudents.map(student => (
                            <Grid item xs={12} sm={6} md={4} key={student.id}>
                                <Card sx={{ borderRadius: 4, boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: '0.2s' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700, fontSize: 24, mr: 2 }}>
                                            {student.first_name?.[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                {student.first_name} {student.last_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Φοιτητής
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Αποστολή Email">
                                            <IconButton
                                                color="primary"
                                                sx={{ bgcolor: theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(33, 150, 243, 0.1)' }}
                                                onClick={() => {
                                                    // Note: In Supabase, getting auth user emails natively via API isn't easy 
                                                    // unless it's stored in the profiles table. If the email doesn't exist, we fallback to a notice.
                                                    alert('Email functionality requires email to be synced to the public profiles table.');
                                                }}
                                            >
                                                <EmailIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default StudentsDirectory;
