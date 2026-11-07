import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { FileText, Users, GraduationCap } from 'lucide-react';

const useCounter = (target, duration = 900) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatItem = ({ target, suffix = '', label, icon }) => {
  const count = useCounter(target);
  return (
    <Box
      sx={{
        flex: 1,
        p: { xs: 2, sm: 2.5 },
        borderRadius: '12px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', sm: 'flex-start' },
        textAlign: { xs: 'center', sm: 'left' },
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, fontWeight: 800, color: 'text.primary', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {count}{suffix}
      </Typography>
    </Box>
  );
};

export const HomeStats = () => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', mt: { xs: 4, md: 5 } }}>
      <StatItem target={150} suffix="+" label="Θέματα Εξετάσεων" icon={<FileText size={18} />} />
      <StatItem target={25} suffix="+" label="Συνεισφέροντες" icon={<Users size={18} />} />
      <StatItem target={8} label="Εξάμηνα Σπουδών" icon={<GraduationCap size={18} />} />
    </Stack>
  );
};

