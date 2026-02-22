import React, { useState } from 'react';
import { Box, IconButton, Typography, CircularProgress, Dialog, AppBar, Toolbar, Slide } from '@mui/material';
import { Document, Page } from 'react-pdf';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const PdfPreview = ({ fileUrl, showAllPages = false }) => {
    const theme = useTheme();
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const renderContent = () => (
        <Box sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#121212',
            py: 2
        }}>
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<CircularProgress sx={{ mt: 4 }} />}
            >
                {showAllPages ? (
                    Array.from(new Array(numPages || 0), (el, index) => (
                        <Box key={`page_${index + 1}`} sx={{ mb: 2, boxShadow: 3 }}>
                            <Page
                                pageNumber={index + 1}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Box>
                    ))
                ) : (
                    <Box sx={{ mb: 2, boxShadow: 3 }}>
                        <Page
                            pageNumber={1}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Box>
                )}
            </Document>
        </Box>
    );

    const renderControls = (isInDialog = false) => (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            p: 1,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            width: '100%'
        }}>
            <IconButton onClick={handleZoomOut} disabled={scale <= 0.5} size="small"><ZoomOutIcon /></IconButton>
            <Typography variant="body2" sx={{ minWidth: 45, textAlign: 'center', fontWeight: 600 }}>{Math.round(scale * 100)}%</Typography>
            <IconButton onClick={handleZoomIn} disabled={scale >= 4.0} size="small"><ZoomInIcon /></IconButton>
            {!isInDialog && (
                <IconButton onClick={() => setIsFullscreen(true)} size="small" sx={{ ml: 1 }}><FullscreenIcon /></IconButton>
            )}
        </Box>
    );

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {renderContent()}
            </Box>
            {renderControls()}

            <Dialog
                fullScreen
                open={isFullscreen}
                onClose={() => setIsFullscreen(false)}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', pt: 'env(safe-area-inset-top, 0px)' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setIsFullscreen(false)} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Προβολή PDF
                        </Typography>
                        <IconButton color="inherit" onClick={() => setIsFullscreen(false)}>
                            <FullscreenExitIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                    <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        {renderContent()}
                    </Box>
                    {renderControls(true)}
                </Box>
            </Dialog>
        </Box>
    );
};

export default PdfPreview;
