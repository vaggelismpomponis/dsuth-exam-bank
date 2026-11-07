import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { SlidersHorizontal, X } from 'lucide-react';

const PERIODS = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

export const CourseFilesFilterBar = ({
  yearFilter,
  periodFilter,
  years = [],
  totalCount,
  onSelectYear,
  onSelectPeriod,
  onResetFilters,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const isOpen = Boolean(anchorEl);
  const activeCount = [yearFilter, periodFilter].filter(Boolean).length;
  const hasActiveFilters = activeCount > 0;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={hasActiveFilters ? 'contained' : 'outlined'}
            color={hasActiveFilters ? 'primary' : 'inherit'}
            startIcon={<SlidersHorizontal size={16} />}
            onClick={handleOpen}
            aria-label="Άνοιγμα φίλτρων"
            aria-expanded={isOpen}
            sx={{
              borderRadius: '8px',
              minHeight: 34,
              px: 1.75,
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderColor: hasActiveFilters ? 'primary.main' : 'divider',
              bgcolor: hasActiveFilters ? 'primary.main' : 'background.paper',
              color: hasActiveFilters ? '#fff' : 'text.primary',
              '&:hover': {
                bgcolor: hasActiveFilters ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            Φίλτρα {activeCount > 0 ? `(${activeCount})` : ''}
          </Button>

          {yearFilter && (
            <Chip
              label={`Έτος: ${yearFilter}`}
              size="small"
              onDelete={() => onSelectYear('')}
              sx={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', bgcolor: 'action.selected' }}
            />
          )}

          {periodFilter && (
            <Chip
              label={`Περίοδος: ${periodFilter}`}
              size="small"
              onDelete={() => onSelectPeriod('')}
              sx={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', bgcolor: 'action.selected' }}
            />
          )}

          {hasActiveFilters && (
            <Button size="small" onClick={onResetFilters} sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Εκκαθάριση
            </Button>
          )}
        </Box>

        {totalCount !== undefined && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {totalCount} {totalCount === 1 ? 'αρχείο' : 'αρχεία'}
          </Typography>
        )}
      </Box>

      {/* ── Professional Filters Popover ── */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 2.25,
            mt: 1,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 400,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
              <SlidersHorizontal size={17} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Φίλτρα Αρχείων
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} aria-label="Κλείσιμο φίλτρων">
            <X size={16} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Years Section */}
        {years.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.7rem', mb: 1 }}>
              Έτος Εξέτασης
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={!yearFilter ? 'contained' : 'outlined'}
                onClick={() => onSelectYear('')}
                sx={{ minHeight: 30, py: 0.25, px: 1.25, fontSize: '0.75rem', borderRadius: '6px' }}
              >
                Όλα τα έτη
              </Button>
              {years.map((y) => (
                <Button
                  key={y}
                  size="small"
                  variant={String(yearFilter) === String(y) ? 'contained' : 'outlined'}
                  onClick={() => onSelectYear(String(yearFilter) === String(y) ? '' : y)}
                  sx={{ minHeight: 30, py: 0.25, px: 1.25, fontSize: '0.75rem', borderRadius: '6px' }}
                >
                  {y}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* Period Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.7rem', mb: 1 }}>
            Εξεταστική Περίοδος
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant={!periodFilter ? 'contained' : 'outlined'}
              onClick={() => onSelectPeriod('')}
              sx={{ minHeight: 30, py: 0.25, px: 1.25, fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Όλες οι εξεταστικές
            </Button>
            {PERIODS.map((p) => (
              <Button
                key={p}
                size="small"
                variant={periodFilter === p ? 'contained' : 'outlined'}
                onClick={() => onSelectPeriod(periodFilter === p ? '' : p)}
                sx={{ minHeight: 30, py: 0.25, px: 1.25, fontSize: '0.75rem', borderRadius: '6px' }}
              >
                {p}
              </Button>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="small"
            color="inherit"
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
            sx={{ fontSize: '0.75rem', borderRadius: '6px' }}
          >
            Εκκαθάριση
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleClose}
            sx={{ fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', px: 2 }}
          >
            Εφαρμογή
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};
