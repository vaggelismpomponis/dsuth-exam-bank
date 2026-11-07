import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useCourseFilesData } from '../components/courseFiles/useCourseFilesData';
import { CourseFilesHero } from '../components/courseFiles/CourseFilesHero';
import { CourseFilesFilterBar } from '../components/courseFiles/CourseFilesFilterBar';
import { CourseFileItem } from '../components/courseFiles/CourseFileItem';
import { downloadFile, shareFile } from '../utils/nativeDownload';
import { normalizeFileUrl } from '../lib/urlNormalizer';
import { trackEvent } from '../lib/analytics';

const CourseFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { course, files, loading, isAdmin, error, success, approveFile, deleteFile } = useCourseFilesData(id);

  const [yearFilter, setYearFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(files.map((f) => f.year).filter(Boolean))).sort((a, b) => b - a);
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchYear = !yearFilter || String(f.year) === String(yearFilter);
      const matchPeriod = !periodFilter || String(f.period) === String(periodFilter);
      return matchYear && matchPeriod;
    });
  }, [files, yearFilter, periodFilter]);

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    setDownloadingAll(true);
    try {
      const zip = new JSZip();
      let addedCount = 0;

      for (const f of files) {
        const url = normalizeFileUrl(f.file_url);
        if (!url) continue;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const blob = await res.blob();
          const filename = `${course?.name || 'course'}_${f.year || ''}_${f.period || ''}.pdf`;
          zip.file(filename, blob);
          addedCount += 1;
        } catch (fetchErr) {
          console.warn('Skipping file fetch error:', fetchErr);
        }
      }

      if (addedCount === 0) {
        throw new Error('Δεν βρέθηκαν διαθέσιμα αρχεία για λήψη.');
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${course?.name || 'course'}_all_exams.zip`);
      trackEvent('download_all', { courseId: id, filesCount: addedCount });
      enqueueSnackbar('Η λήψη ολοκληρώθηκε επιτυχώς!', { variant: 'success' });
    } catch (err) {
      console.error('Download all error:', err);
      enqueueSnackbar(err?.message || 'Σφάλμα κατά τη λήψη αρχείων.', { variant: 'error' });
    } finally {
      setDownloadingAll(false);
    }
  };

  const handlePreview = (f) => {
    const url = normalizeFileUrl(f.file_url) || '';
    const filename = url.split('/').pop().split('?')[0];
    const params = new URLSearchParams({
      url,
      name: filename,
      course: course?.name || '',
      period: f.period || '',
      year: String(f.year || ''),
    });
    navigate(`/viewer?${params.toString()}`);
  };

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <CourseFilesHero
        course={course}
        filesCount={files.length}
        onDownloadAll={handleDownloadAll}
        isDownloadingAll={downloadingAll}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 }, pt: { xs: 3, md: 4 } }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

        {files.length > 0 && (
          <CourseFilesFilterBar
            yearFilter={yearFilter}
            periodFilter={periodFilter}
            years={yearOptions}
            totalCount={filteredFiles.length}
            onSelectYear={setYearFilter}
            onSelectPeriod={setPeriodFilter}
            onResetFilters={() => { setYearFilter(''); setPeriodFilter(''); }}
          />
        )}

        {loading && (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={76} sx={{ borderRadius: '12px' }} />
            ))}
          </Stack>
        )}

        {!loading && filteredFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, px: 3, border: '1px dashed', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Δεν βρέθηκαν αρχεία
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Δεν υπάρχουν αρχεία με τα επιλεγμένα φίλτρα.
            </Typography>
          </Box>
        )}

        {!loading && filteredFiles.length > 0 && (
          <Stack spacing={1.5}>
            {filteredFiles.map((file) => (
              <CourseFileItem
                key={file.id}
                file={file}
                courseName={course?.name || ''}
                isAdmin={isAdmin}
                onPreview={handlePreview}
                onDownload={(f) => downloadFile(normalizeFileUrl(f.file_url), `${course?.name}_${f.year}.pdf`)}
                onShare={async (f) => {
                  const res = await fetch(normalizeFileUrl(f.file_url));
                  const blob = await res.blob();
                  shareFile(blob, `${course?.name}_${f.year}.pdf`);
                }}
                onApprove={approveFile}
                onDelete={(f) => setConfirmDel(f)}
              />
            ))}
          </Stack>
        )}

        <Dialog open={Boolean(confirmDel)} onClose={() => setConfirmDel(null)} PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Επιβεβαίωση Διαγραφής</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτό το αρχείο;
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmDel(null)} sx={{ borderRadius: '8px' }}>Ακύρωση</Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                if (confirmDel) deleteFile(confirmDel.id, confirmDel.file_url?.split('/').pop());
                setConfirmDel(null);
              }}
              sx={{ borderRadius: '8px' }}
            >
              Διαγραφή
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CourseFiles;
