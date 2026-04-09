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
    const [zoom, setZoom] = useState(1.0);          // multiplier on top of fit-width
    const [containerWidth, setContainerWidth] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn  = () => setZoom(prev => Math.min(+(prev + 0.25).toFixed(2), 4.0));
    const handleZoomOut = () => setZoom(prev => Math.max(+(prev - 0.25).toFixed(2), 0.5));

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    /* Measures the scroll container so Page width fills it exactly */
    const scrollRef = React.useCallback((node) => {
        if (!node) return;
        const measure = () => setContainerWidth(node.clientWidth > 0 ? node.clientWidth : null);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    /* Effective pixel width for each PDF page */
    const pageWidth = containerWidth ? containerWidth * zoom : undefined;

    const renderContent = (extraPy = 2) => (
        <Box
            ref={scrollRef}
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                overflowX: zoom > 1 ? 'auto' : 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#121212',
                py: extraPy,
                boxSizing: 'border-box',
            }}
        >
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<CircularProgress sx={{ mt: 4 }} />}
            >
                {showAllPages ? (
                    Array.from(new Array(numPages || 0), (_, index) => (
                        <Box key={`page_${index + 1}`} sx={{ mb: 2, boxShadow: 3, maxWidth: '100%' }}>
                            <Page
                                pageNumber={index + 1}
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Box>
                    ))
                ) : (
                    <Box sx={{ mb: 2, boxShadow: 3, maxWidth: '100%' }}>
                        <Page
                            pageNumber={1}
                            width={pageWidth}
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
            width: '100%',
            flexShrink: 0,
        }}>
            <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5} size="small"><ZoomOutIcon /></IconButton>
            <Typography variant="body2" sx={{ minWidth: 45, textAlign: 'center', fontWeight: 600 }}>
                {Math.round(zoom * 100)}%
            </Typography>
            <IconButton onClick={handleZoomIn} disabled={zoom >= 4.0} size="small"><ZoomInIcon /></IconButton>
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
                PaperProps={{ sx: { borderRadius: '0 !important', m: 0 } }}
            >
                <AppBar sx={{ position: 'relative', pt: 'env(safe-area-inset-top, 0px)', borderRadius: 0 }}>
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
                        {renderContent(2)}
                    </Box>
                    {renderControls(true)}
                </Box>
            </Dialog>
        </Box>
    );
};

export default PdfPreview;
