// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SiteVisitCallReportForm } from '@/types/checklist.types';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
        finalY: number;
    };
}

export const generateSiteVisitReportPDF = (
    formData: SiteVisitCallReportForm,
    reportNumber: string,
    ncbaLogoBase64?: string, // Ensure this is a full data URI: "data:image/png;base64,..."
    approvedBy?: string,
    approvalDate?: string
): jsPDF => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // --- INTERNAL UTILITIES ---
    const formatCurrency = (value: any): string => {
        if (!value) return 'KES 0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNairobiDateTime = (isoString: string): string => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-KE', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
            }).replace(',', '');
        } catch { return isoString; }
    };

    const formatNairobiDate = (isoString: string): string => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return isoString; }
    };

    const colors = {
        primary800: [26, 54, 54],   // #1A3636
        accent500: [214, 189, 152], // #D6BD98
        neutral100: [243, 244, 246],// #F3F4F6
        neutral600: [75, 85, 99],   // #4B5563
        textBlack: [31, 41, 55],    // #1F2937
        white: [255, 255, 255]
    };

    const setFont = (isBold = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    };

    // --- ROBUST HEADER LOGIC ---
    const drawFirstPageHeader = () => {
        // 1. Dark Green Bar
        doc.setFillColor(...colors.primary800);
        doc.rect(0, 0, pageWidth, 30, 'F');

        // 2. NCBA Logo Placement
        if (ncbaLogoBase64 && ncbaLogoBase64.startsWith('data:image')) {
            try {
                // Add white background rectangle for the logo
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(margin - 2, 5, 38, 20, 1, 1, 'F');

                // Detect format automatically (fixes "wrong PNG signature")
                const format = ncbaLogoBase64.includes('png') ? 'PNG' : 'JPEG';

                doc.addImage(
                    ncbaLogoBase64,
                    format,
                    margin,
                    7,
                    34,
                    16,
                    undefined,
                    'FAST'
                );
            } catch (e) {
                console.error("Logo Rendering Error:", e);
                // Fallback text if image fails
                doc.setTextColor(...colors.white);
                setFont(true);
                doc.setFontSize(14);
                doc.text('NCBA BANK', margin, 18);
            }
        } else {
            // Fallback text if no logo string is provided
            doc.setTextColor(...colors.white);
            setFont(true);
            doc.setFontSize(14);
            doc.text('NCBA BANK', margin, 18);
        }

        // 3. GeoBuild Branding (Right)
        doc.setTextColor(...colors.white);
        setFont(true);
        doc.setFontSize(24);
        doc.text('GeoBuild', pageWidth - margin, 19, { align: 'right' });

        // 4. Accent Underline
        doc.setFillColor(...colors.accent500);
        doc.rect(0, 30, pageWidth, 2, 'F');
    };

    const addReportTitle = (y: number) => {
        setFont(true);
        doc.setTextColor(...colors.primary800);
        doc.setFontSize(18);
        doc.text('Site Visit Call Report', pageWidth / 2, y, { align: 'center' });

        setFont(false);
        doc.setFontSize(9);
        doc.setTextColor(...colors.neutral600);
        const subTitle = `Call Report No: ${reportNumber}  |  Date: ${formatNairobiDateTime(new Date().toISOString())}`;
        doc.text(subTitle, pageWidth / 2, y + 7, { align: 'center' });
        return y + 18;
    };

    const createSection = (title: string, data: any[][], startY: number) => {
        if (startY > pageHeight - 50) {
            doc.addPage();
            startY = 20;
        }

        doc.setFillColor(...colors.neutral100);
        doc.rect(margin, startY - 2, pageWidth - (margin * 2), 8, 'F');
        doc.setFillColor(...colors.accent500);
        doc.rect(margin, startY - 2, 3, 8, 'F');

        doc.setTextColor(...colors.primary800);
        setFont(true);
        doc.setFontSize(10);
        doc.text(title, margin + 6, startY + 3.5);

        autoTable(doc, {
            startY: startY + 6,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                font: 'helvetica',
                lineColor: [220, 220, 220],
                textColor: colors.textBlack
            },
            columnStyles: {
                0: { fillColor: [250, 250, 250], fontStyle: 'bold', cellWidth: 55, textColor: colors.primary800 },
                1: { textColor: colors.neutral600 }
            },
            body: data,
        });

        return (doc as any).lastAutoTable.finalY + 10;
    };

    // --- CONTENT ---
    drawFirstPageHeader();
    let currentY = addReportTitle(50);

    // 1. CUSTOMER INFORMATION
    currentY = createSection('1. CUSTOMER INFORMATION', [
        ['Call Report No.', formData.callReportNo || '-'],
        ['Customer Name', formData.customerName || '-'],
        ['Customer Type', formData.customerType || '-'],
        ['Brief Profile', formData.briefProfile || '-'],
        ['IBPS No.', formData.ibpsNo || '-'],
        ['Customer Number', formData.customerNumber || '-'],
        ['Project Name', formData.projectName || '-']
    ], currentY);

    // 2. SITE VISIT DETAILS
    currentY = createSection('2. SITE VISIT DETAILS', [
        ['Visit Date & Time', formatNairobiDateTime(formData.siteVisitDateTime)],
        ['Person Met at Site', formData.personMetAtSite || '-'],
        ['Exact Location', formData.siteExactLocation || '-'],
        ['House Located Along', formData.houseLocatedAlong || '-'],
        ['Site PIN', formData.sitePin || '-'],
        ['Security Details', formData.securityDetails || '-'],
        ['Plot/LR No.', formData.plotLrNo || '-']
    ], currentY);

    // 3. FINANCIAL SUMMARY
    currentY = createSection('3. FINANCIAL SUMMARY', [
        ['BQ Amount', formatCurrency(formData.bqAmount)],
        ['Construction Loan Amount', formatCurrency(formData.constructionLoanAmount)],
        ['Customer Contribution', formatCurrency(formData.customerContribution)],
        ['Drawn Funds (D1)', formatCurrency(formData.drawnFundsD1)],
        ['Drawn Funds (D2)', formatCurrency(formData.drawnFundsD2)],
        ['Subtotal Drawn', formatCurrency(formData.drawnFundsSubtotal)]
    ], currentY);

    // Page 2
    doc.addPage();
    currentY = 20;

    currentY = createSection('4. PROJECT PROGRESS', [
        ['Works Complete', formData.worksComplete || '-'],
        ['Works Ongoing', formData.worksOngoing || '-'],
        ['Materials Found on Site', formData.materialsFoundOnSite || '-'],
        ['Defects Noted on Site', formData.defectsNotedOnSite || '-'],
        ['Drawdown Request No.', formData.drawdownRequestNo || '-'],
        ['Drawdown KES Amount', formatCurrency(formData.drawdownKesAmount)]
    ], currentY);

    // Objectives
    setFont(true);
    doc.setTextColor(...colors.primary800);
    doc.text('Site Visit Objectives:', margin, currentY);
    setFont(false);
    doc.setTextColor(...colors.neutral600);
    const objectives = [
        `1. ${formData.siteVisitObjective1 || 'Confirm progress on site and level of work done'}`,
        `2. ${formData.siteVisitObjective2 || 'Confirm status of building/visible defects'}`,
        `3. ${formData.siteVisitObjective3 || 'Note materials stored on site'}`
    ];
    objectives.forEach((obj, i) => {
        doc.text(obj, margin + 5, currentY + 6 + (i * 5));
    });
    currentY += 25;

    currentY = createSection('5. DOCUMENTS SUBMITTED', [
        ['QS Valuation', formData.documentsSubmitted?.qsValuation || '-'],
        ['Interim Certificate', formData.documentsSubmitted?.interimCertificate || '-'],
        ['Instruction Letter', formData.documentsSubmitted?.customerInstructionLetter || '-'],
        ['Progress Report', formData.documentsSubmitted?.contractorProgressReport || '-'],
        ['Invoice', formData.documentsSubmitted?.contractorInvoice || '-']
    ], currentY);

    currentY = createSection('6. SIGN-OFF', [
        ['Prepared By', formData.preparedBy || '-'],
        ['Signature', formData.signature || '-'],
        ['Date', formData.preparedDate ? formatNairobiDate(formData.preparedDate) : '-']
    ], currentY);

    if (approvedBy) {
        doc.setFillColor(...colors.neutral100);
        doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 18, 2, 2, 'F');
        setFont(true);
        doc.text(`✓ Approved By: ${approvedBy}`, margin + 5, currentY + 7);
        setFont(false);
        doc.text(`Date: ${approvalDate ? formatNairobiDate(approvalDate) : '-'}`, margin + 5, currentY + 13);
    }

    // PHOTO PAGES
    const photoSets = [
        { title: '7. PROGRESS PHOTOS', data: formData.progressPhotosPage3 },
        { title: '8. MATERIALS ON SITE', data: formData.materialsOnSitePhotos },
        { title: '9. DEFECTS NOTED', data: formData.defectsNotedPhotos }
    ];

    photoSets.forEach(set => {
        const validPhotos = set.data?.filter(p => p && p.trim() !== '') || [];
        if (validPhotos.length > 0) {
            doc.addPage();
            currentY = 20;
            doc.setFillColor(...colors.neutral100);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
            doc.setFillColor(...colors.accent500);
            doc.rect(margin, currentY, 3, 8, 'F');
            setFont(true);
            doc.text(set.title, margin + 6, currentY + 5.5);

            validPhotos.forEach((img, idx) => {
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const x = margin + (col * 92);
                const y = currentY + 15 + (row * 75);
                try {
                    doc.addImage(img, 'JPEG', x, y, 85, 60, undefined, 'FAST');
                    doc.setFontSize(8);
                    doc.text(`Photo ${idx + 1}`, x + 35, y + 66);
                } catch (e) {
                    doc.rect(x, y, 85, 60);
                    doc.text('Image Error', x + 30, y + 30);
                }
            });
        }
    });

    // FOOTER
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(...colors.neutral600);
        doc.text('NCBA Bank Kenya - Confidential', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Gen: ${formatNairobiDate(new Date().toISOString())}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    return doc;
};