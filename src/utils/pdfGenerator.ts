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

// ─── BRAND COLOURS (BASED ON NCBA REPORT STYLE) ──────────────────────────────
const NCBA_DARK = '#1A3636';
const NCBA_GOLD_ACCENT = '#D6BD98'; 
const SECTION_BG = '#F3F4F6';      
const TABLE_BORDER = '#D1D5DB';    
const TEXT_BLACK = '#1F2937';

// Helper function to format status for display
const formatStatus = (status?: string): string => {
    if (!status) return 'Draft';
    
    const statusLower = status.toLowerCase();
    
    const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'draft': 'Draft',
        'submitted': 'QS Review',
        'pending_qs_review': 'QS Review',
        'pendingqsreview': 'QS Review',
        'under_review': 'Under Review',
        'underreview': 'Under Review',
        'rework': 'Rework',
        'revision_requested': 'Rework',
        'returned': 'Rework',
        'approved': 'Approved',
        'completed': 'Completed',
        'rejected': 'Rejected'
    };
    
    return statusMap[statusLower] || 'Draft';
};

export const generateSiteVisitReportPDF = (
    formData: SiteVisitCallReportForm,
    reportNumber: string,
    ncbaLogoBase64?: string,
    reportStatus?: string, // Changed from approvedBy to reportStatus
    approvalDate?: string
): jsPDF => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    doc.setLineHeightFactor(1.3);

    // --- INTERNAL UTILITIES ---
    const formatCurrency = (value: any): string => {
        if (!value) return 'KES 0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'KES 0.00';
        return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNairobiDate = (isoString: string): string => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch { return isoString; }
    };

    const val = (v?: string | null, fallback = 'None') => (v && v.trim() ? v : fallback);

    // --- PAGE HEADER (Logo Left, System Name Right) ---
    const addPageHeader = () => {
        // ENLARGED NCBA Logo on the Far Left
        if (ncbaLogoBase64 && ncbaLogoBase64.startsWith('data:image')) {
            try {
                const format = ncbaLogoBase64.includes('png') ? 'PNG' : 'JPEG';
                // ENLARGED: Increased from 30x10 to 45x15
                doc.addImage(ncbaLogoBase64, format, margin, 6, 45, 15, undefined, 'FAST');
            } catch (e) { console.error("Logo error", e); }
        }

        // System Name "GeoBuild" on the Far Right
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(NCBA_DARK);
        doc.text('GeoBuild', pageWidth - margin, 15, { align: 'right' });

        // Subtle divider line under header - moved down slightly to accommodate larger logo
        doc.setDrawColor(SECTION_BG);
        doc.setLineWidth(0.1);
        doc.line(margin, 22, pageWidth - margin, 22);
    };

    // --- SECTION HEADER (Grey bar with Gold Square) ---
    const addSectionTitle = (title: string, y: number): number => {
        doc.setFillColor(SECTION_BG);
        doc.rect(margin, y, contentWidth, 8, 'F');

        doc.setFillColor(NCBA_GOLD_ACCENT);
        doc.rect(margin, y, 4, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(TEXT_BLACK);
        doc.text(title.toUpperCase(), margin + 7, y + 5.5);

        return y + 10;
    };

    // --- TABLE GENERATOR ---
    const createSection = (title: string, data: any[][], startY: number): number => {
        if (startY > pageHeight - 50) {
            doc.addPage();
            addPageHeader();
            startY = 25;
        }

        startY = addSectionTitle(title, startY);

        autoTable(doc, {
            startY: startY,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                font: 'helvetica',
                lineColor: TABLE_BORDER,
                textColor: TEXT_BLACK,
                lineWidth: 0.1
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: contentWidth * 0.4 },
                1: { cellWidth: contentWidth * 0.6 }
            },
            body: data,
        });

        return (doc as any).lastAutoTable.finalY + 8;
    };

    // --- START DRAWING ---
    addPageHeader();

    // Format the status for display
    const displayStatus = formatStatus(reportStatus);
    
    // Determine status color
    const getStatusColor = (status: string): [number, number, number] => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('approved')) return [0, 128, 0]; // Green
        if (lowerStatus.includes('rework')) return [255, 140, 0]; // Orange
        if (lowerStatus.includes('review')) return [0, 81, 158]; // Blue
        if (lowerStatus.includes('pending')) return [128, 128, 128]; // Gray
        return [100, 100, 100]; // Default gray
    };

    // Main Title and Metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Site Visit Call Report', pageWidth / 2, 38, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const reportStr = `Call Report No: ${reportNumber} | Status: `;
    const statusStr = displayStatus;
    const combinedWidth = doc.getTextWidth(reportStr + statusStr);
    const startX = (pageWidth - combinedWidth) / 2;

    doc.text(reportStr, startX, 45);
    doc.setTextColor(...getStatusColor(displayStatus));
    doc.setFont('helvetica', 'bold');
    doc.text(statusStr, startX + doc.getTextWidth(reportStr), 45);

    let currentY = 53;

    // 1. CUSTOMER INFORMATION
    currentY = createSection('1. CUSTOMER INFORMATION', [
        ['Name of the customer:', val(formData.customerName)],
        ['Salaried/Consultancy/Business:', val(formData.customerType)],
        ['Project Name:', val(formData.projectName)],
        ['Date & time of site visit:', val(formData.siteVisitDateTime)],
        ['Designation/name of person met:', val(formData.personMetAtSite)],
        [{ content: 'Amounts Breakdown', colSpan: 2, styles: { fillColor: SECTION_BG, fontStyle: 'bold' } }],
        ['BQ amount:', formatCurrency(formData.bqAmount)],
        ['Construction loan amount:', formatCurrency(formData.constructionLoanAmount)],
        ['Customer\'s contribution:', formatCurrency(formData.customerContribution)],
        ['Drawn Funds to Date:', ''],
        [{ content: 'D1: KES.', styles: { halign: 'right' } }, formatCurrency(formData.drawnFundsD1).replace('KES ', '')],
        [{ content: 'D2: KES.', styles: { halign: 'right' } }, formatCurrency(formData.drawnFundsD2).replace('KES ', '')],
        [{ content: 'Sub-total:', styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(formData.drawnFundsSubtotal)],
        ['Undrawn funds to date:', formatCurrency(formData.undrawnFundsToDate)]
    ], currentY);

    // 2. ADDITIONAL INFORMATION
    currentY = createSection('2. ADDITIONAL INFORMATION', [
        ['Brief profile of the customer:', val(formData.briefProfile)],
        [{ content: 'Details of the Site', colSpan: 2, styles: { fillColor: SECTION_BG, fontStyle: 'bold' } }],
        ['Exact location:', val(formData.siteExactLocation)],
        ['House located along:', val(formData.houseLocatedAlong)],
        ['Site Pin:', val(formData.sitePin)],
        ['Security details:', val(formData.securityDetails)],
        ['Plot/LR No.:', val(formData.plotLrNo)]
    ], currentY);

    // 3. PROJECT INFORMATION
    currentY = createSection('3. PROJECT INFORMATION', [
        [{ content: 'Site Visit Objectives', colSpan: 2, styles: { fillColor: SECTION_BG, fontStyle: 'bold' } }],
        ['Objective 1: Progress', formData.siteVisitObjective1 || 'Confirm progress on site and level of work done'],
        ['Objective 2: Defects', formData.siteVisitObjective2 || 'Confirm status of building and visible defects'],
        ['Objective 3: Materials', formData.siteVisitObjective3 || 'Take note of materials stored on site'],
        ['Works Complete:', val(formData.worksComplete)],
        ['Works Ongoing:', val(formData.worksOngoing)],
        ['Materials Found on Site:', val(formData.materialsFoundOnSite)],
        ['Defects Noted on Site:', val(formData.defectsNotedOnSite)],
        ['Drawdown Request No.:', val(formData.drawdownRequestNo)],
        ['Drawdown KES Amount:', formatCurrency(formData.drawdownKesAmount)]
    ], currentY);

    // 4. DOCUMENTS SUBMITTED
    currentY = createSection('4. DOCUMENTS SUBMITTED', [
        ['QS Valuation', val(formData.documentsSubmitted?.qsValuation, 'Yes')],
        ['Interim Certificate', val(formData.documentsSubmitted?.interimCertificate, 'Yes')],
        ['Customer Instruction Letter', val(formData.documentsSubmitted?.customerInstructionLetter, 'Yes')],
        ['Contractor\'s Progress Report', val(formData.documentsSubmitted?.contractorProgressReport, 'Yes')],
        ['Contractor\'s Invoice', val(formData.documentsSubmitted?.contractorInvoice, 'Yes')]
    ], currentY);

    // 5. SIGN-OFF
    currentY = createSection('5. SIGN-OFF', [
        ['Prepared By:', val(formData.preparedBy)],
        ['Signature:', val(formData.signature)],
        ['Date of Preparation:', formatNairobiDate(formData.preparedDate || '')]
    ], currentY);

    // Approval Section
    if (currentY > pageHeight - 35) { doc.addPage(); currentY = 25; }
    doc.setDrawColor(NCBA_GOLD_ACCENT);
    doc.setLineWidth(0.4);
    doc.rect(margin, currentY, contentWidth, 22);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorised by:', margin + 5, currentY + 8);
    doc.text('Designation:', margin + (contentWidth / 2) + 5, currentY + 8);
    doc.setDrawColor(TABLE_BORDER);
    doc.line(margin + 5, currentY + 18, margin + 65, currentY + 18);
    doc.line(margin + (contentWidth / 2) + 5, currentY + 18, margin + contentWidth - 5, currentY + 18);

    // --- PHOTO PAGES (Grid layout) ---
    const photoSets = [
        { title: 'PROGRESS PHOTOS', data: formData.progressPhotosPage3 || [] },
        { title: 'MATERIALS ON SITE', data: formData.materialsOnSitePhotos || [] },
        { title: 'DEFECTS NOTED ON SITE', data: formData.defectsNotedPhotos || [] }
    ];

    photoSets.forEach(set => {
        if (set.data.length === 0) return;
        doc.addPage();
        addPageHeader();
        let py = addSectionTitle(set.title, 25);
        
        const imgWidth = (contentWidth - 10) / 2;
        const imgHeight = 60;

        set.data.forEach((img, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            if (row > 0 && idx % 4 === 0) { doc.addPage(); addPageHeader(); py = addSectionTitle(set.title, 25); }
            
            const px = margin + (col * (imgWidth + 10));
            const yPos = py + (Math.floor((idx % 4) / 2) * (imgHeight + 15));

            try {
                doc.addImage(img, 'JPEG', px, yPos, imgWidth, imgHeight, undefined, 'FAST');
                doc.setDrawColor(TABLE_BORDER);
                doc.rect(px, yPos, imgWidth, imgHeight);
            } catch (e) { console.error(e); }
        });
    });

    // --- FOOTER ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('NCBA', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    return doc;
};