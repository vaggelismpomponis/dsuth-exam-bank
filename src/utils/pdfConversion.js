import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';

export const convertToPdf = async (file, onProgress) => {
    if (file.type === 'application/pdf') {
        return file; // Already a PDF
    }

    onProgress(`Επεξεργασία και μετατροπή ${file.name} σε PDF...`);

    try {
        const pdf = new jsPDF();

        if (file.type.startsWith('image/')) {
            const imgData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // If image is taller than page, might need multi-page, but for exam bank a single scaled page or long page is usually okay.
            // We'll just scale it to fit the width. If it's very tall, part of it goes off the bottom of the first page.
            // To be safe, let's adjust the page size to match the image ratio if it's taller.
            if (pdfHeight > pdf.internal.pageSize.getHeight()) {
                const newPdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [pdfWidth, pdfHeight]
                });
                newPdf.addImage(imgData, file.type === 'image/png' ? 'PNG' : 'JPEG', 0, 0, pdfWidth, pdfHeight);
                const blob = newPdf.output('blob');
                return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: 'application/pdf' });
            } else {
                pdf.addImage(imgData, file.type === 'image/png' ? 'PNG' : 'JPEG', 0, 0, pdfWidth, pdfHeight);
                const blob = pdf.output('blob');
                return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: 'application/pdf' });
            }
        }

        if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            onProgress(`Εξαγωγή κειμένου από το έγγραφο Word...`);
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value || 'Κενό έγγραφο ή μη αναγνωρίσιμο κείμενο.';

            onProgress(`Δημιουργία σελίδων PDF...`);
            const marginLeft = 10;
            const marginTop = 10;
            const maxWidth = pdf.internal.pageSize.getWidth() - 20;

            // Add a simple font check or fallback, jsPDF standard fonts don't support Greek well by default
            // We might have encoding issues with Greek text in standard jsPDF without a custom font.
            // But we will try our best. This is a known limitation of client-side jsPDF without loaded TTF fonts.
            const lines = pdf.splitTextToSize(text, maxWidth);

            let cursorY = marginTop;
            lines.forEach(line => {
                if (cursorY > pdf.internal.pageSize.getHeight() - 10) {
                    pdf.addPage();
                    cursorY = marginTop;
                }
                pdf.text(line, marginLeft, cursorY);
                cursorY += 7; // line height
            });

            const blob = pdf.output('blob');
            return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: 'application/pdf' });
        }

        // Fallback if we cannot convert it
        onProgress(`Η μετατροπή σε PDF για αυτόν τον τύπο αρχείου δεν υποστηρίζεται πλήρως. Θα χρησιμοποιηθεί το αρχικό αρχείο.`);
        await new Promise(r => setTimeout(r, 1500));
        return file;

    } catch (error) {
        console.error('PDF Conversion error: ', error);
        onProgress(`Σφάλμα μετατροπής σε PDF. Θα χρησιμοποιηθεί το αρχικό αρχείο.`);
        await new Promise(r => setTimeout(r, 1500));
        return file; // Fallback to original
    }
};
