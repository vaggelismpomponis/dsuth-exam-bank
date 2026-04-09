import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';

// Μετατρέπει blob σε base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
};

/**
 * Downloads a file silently. On native, fetches the data and saves it
 * to the device's Documents directory. On web, triggers a standard download.
 * 
 * @param {Blob|string} blobOrUrl - Blob data or a URL string
 * @param {string} filename - The filename for saving
 */
export const downloadFile = async (blobOrUrl, filename) => {
    if (Capacitor.isNativePlatform()) {
        try {
            let blob = blobOrUrl;
            if (typeof blobOrUrl === 'string') {
                const response = await fetch(blobOrUrl, { mode: 'cors' });
                if (!response.ok) throw new Error('Fetch failed');
                blob = await response.blob();
            }

            const base64DataUrl = await blobToBase64(blob);
            const base64Data = base64DataUrl.split(',')[1];

            await Filesystem.writeFile({
                path: `DSUth/${filename}`,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true,
            });

            // Returns silently — caller handles the success notification
        } catch (e) {
            console.error('Σφάλμα κατά τη λήψη μέσω Capacitor:', e);
            throw e;
        }
    } else {
        if (typeof blobOrUrl === 'string') {
            try {
                const response = await fetch(blobOrUrl, { mode: 'cors' });
                if (!response.ok) throw new Error('Download failed');
                const blob = await response.blob();
                fallbackDownload(blob, filename);
            } catch {
                const a = document.createElement('a');
                a.href = blobOrUrl;
                a.download = filename;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } else {
            fallbackDownload(blobOrUrl, filename);
        }
    }
};

/**
 * Shares a file using the native share sheet. On web, falls back to download.
 */
export const shareFile = async (blobOrUrl, filename) => {
    if (Capacitor.isNativePlatform()) {
        try {
            let blob = blobOrUrl;
            if (typeof blobOrUrl === 'string') {
                const response = await fetch(blobOrUrl, { mode: 'cors' });
                blob = await response.blob();
            }
            const base64DataUrl = await blobToBase64(blob);
            const base64Data = base64DataUrl.split(',')[1];

            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: filename,
                url: savedFile.uri,
                dialogTitle: 'Κοινοποίηση αρχείου',
            });
        } catch (e) {
            console.error('Σφάλμα κατά την κοινοποίηση μέσω Capacitor:', e);
            if (typeof blobOrUrl !== 'string') {
                fallbackDownload(blobOrUrl, filename);
            }
        }
    } else {
        // Web: try the native Web Share API first (works on mobile browsers)
        try {
            let blob = blobOrUrl;
            if (typeof blobOrUrl === 'string') {
                const response = await fetch(blobOrUrl, { mode: 'cors' });
                if (!response.ok) throw new Error('Fetch failed');
                blob = await response.blob();
            }

            const file = new File([blob], filename, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: filename,
                });
                return;
            }
        } catch (e) {
            // If share was cancelled by user, don't fall back to download
            if (e?.name === 'AbortError') return;
            console.warn('Web Share API failed, falling back to download:', e);
        }

        // Final fallback: download
        if (typeof blobOrUrl !== 'string') {
            fallbackDownload(blobOrUrl, filename);
        } else {
            try {
                const response = await fetch(blobOrUrl, { mode: 'cors' });
                const blob = await response.blob();
                fallbackDownload(blob, filename);
            } catch {
                fallbackDownload(null, filename);
            }
        }
    }
};

const fallbackDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
