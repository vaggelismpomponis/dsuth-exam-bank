import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Trash2 } from 'lucide-react';

export const DeleteAccountDialog = ({
  open,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '16px', p: 0.5 } }}>
      <DialogTitle sx={{ color: 'error.main', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={18} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
          Οριστική Διαγραφή Λογαριασμού
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
          Αυτή η ενέργεια <strong>δεν αναιρείται</strong>. Όλα τα δεδομένα σας θα διαγραφούν οριστικά από το σύστημα.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: '8px' }}>
          Ακύρωση
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          sx={{ borderRadius: '8px', fontWeight: 700 }}
        >
          {deleting ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Διαγραφή'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
