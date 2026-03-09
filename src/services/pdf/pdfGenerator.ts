import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SiteVisitReport } from '@/types/report.types'
import { format } from 'date-fns'

export class PDFGenerator {
    private doc: jsPDF

    constructor() {
        this.doc = new jsPDF()
    }

    /**
     * Generate a PDF report from a SiteVisitReport
     */
    async generateReport(report: SiteVisitReport): Promise<Blob> {
        this.doc = new jsPDF()

        // Add header
        this.addHeader(report)

        // Add report details
        this.addReportDetails(report)

        // Add site information
        this.addSiteInformation(report)

        // Add work progress
        if (report.workProgress && report.workProgress.length > 0) {
            this.addWorkProgress(report.workProgress)
        }

        // Add issues
        if (report.issues && report.issues.length > 0) {
            this.addIssues(report.issues)
        }

        // Add footer
        this.addFooter()

        // Return as blob
        return this.doc.output('blob')
    }

    /**
     * Download the PDF
     */
    async downloadReport(report: SiteVisitReport, filename?: string): Promise<void> {
        await this.generateReport(report)
        const name = filename || `${report.reportNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
        this.doc.save(name)
    }

    private addHeader(report: SiteVisitReport): void {
        const pageWidth = this.doc.internal.pageSize.getWidth()

        // Title
        this.doc.setFontSize(20)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Site Visit Report', pageWidth / 2, 20, { align: 'center' })

        // Report Number
        this.doc.setFontSize(12)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(report.reportNumber, pageWidth / 2, 28, { align: 'center' })

        // Line separator
        this.doc.setLineWidth(0.5)
        this.doc.line(15, 32, pageWidth - 15, 32)
    }

    private addReportDetails(report: SiteVisitReport): void {
        let yPos = 40

        this.doc.setFontSize(14)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Report Information', 15, yPos)

        yPos += 8
        this.doc.setFontSize(10)
        this.doc.setFont('helvetica', 'normal')

        const details = [
            ['Title:', report.title],
            ['Status:', this.formatStatus(report.status)],
            ['Visit Date:', format(new Date(report.visitDate), 'MMMM dd, yyyy')],
            ['Client:', report.client?.name || 'N/A'],
            ['RM:', report.rm ? `${report.rm.firstName} ${report.rm.lastName}` : 'N/A'],
            ['QS:', report.qs ? `${report.qs.firstName} ${report.qs.lastName}` : 'N/A'],
        ]

        details.forEach(([label, value]) => {
            this.doc.setFont('helvetica', 'bold')
            this.doc.text(label, 15, yPos)
            this.doc.setFont('helvetica', 'normal')
            this.doc.text(value, 60, yPos)
            yPos += 6
        })

        if (report.description) {
            yPos += 4
            this.doc.setFont('helvetica', 'bold')
            this.doc.text('Description:', 15, yPos)
            yPos += 6
            this.doc.setFont('helvetica', 'normal')
            const splitDescription = this.doc.splitTextToSize(report.description, 180)
            this.doc.text(splitDescription, 15, yPos)
            yPos += splitDescription.length * 6
        }
    }

    private addSiteInformation(report: SiteVisitReport): void {
        let yPos = this.doc.internal.pageSize.getHeight() / 2

        this.doc.setFontSize(14)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Site Information', 15, yPos)

        yPos += 8
        this.doc.setFontSize(10)
        this.doc.setFont('helvetica', 'normal')

        const siteInfo = [
            ['Address:', report.siteAddress],
            ['Weather:', report.weather || 'N/A'],
            ['Temperature:', report.temperature ? `${report.temperature}°C` : 'N/A'],
        ]

        siteInfo.forEach(([label, value]) => {
            this.doc.setFont('helvetica', 'bold')
            this.doc.text(label, 15, yPos)
            this.doc.setFont('helvetica', 'normal')
            this.doc.text(value, 60, yPos)
            yPos += 6
        })

        if (report.siteCoordinates) {
            yPos += 2
            this.doc.setFont('helvetica', 'bold')
            this.doc.text('Coordinates:', 15, yPos)
            this.doc.setFont('helvetica', 'normal')
            this.doc.text(
                `${report.siteCoordinates.latitude.toFixed(6)}, ${report.siteCoordinates.longitude.toFixed(6)}`,
                60,
                yPos
            )
        }
    }

    private addWorkProgress(workProgress: SiteVisitReport['workProgress']): void {
        this.doc.addPage()
        let yPos = 20

        this.doc.setFontSize(14)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Work Progress', 15, yPos)

        yPos += 10

        const tableData = workProgress.map((item) => [
            item.category,
            item.description,
            `${item.percentage}%`,
            item.notes || '-',
        ])

        autoTable(this.doc, {
            startY: yPos,
            head: [['Category', 'Description', 'Progress', 'Notes']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 9 },
        })
    }

    private addIssues(issues: SiteVisitReport['issues']): void {
        const finalY = (this.doc as any).lastAutoTable?.finalY || 20
        let yPos = finalY + 15

        // Check if we need a new page
        if (yPos > this.doc.internal.pageSize.getHeight() - 60) {
            this.doc.addPage()
            yPos = 20
        }

        this.doc.setFontSize(14)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Issues', 15, yPos)

        yPos += 10

        const tableData = issues.map((issue) => [
            issue.title,
            issue.description,
            this.formatSeverity(issue.severity),
            this.formatIssueStatus(issue.status),
        ])

        autoTable(this.doc, {
            startY: yPos,
            head: [['Title', 'Description', 'Severity', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [239, 68, 68] },
            styles: { fontSize: 9 },
        })
    }

    private addFooter(): void {
        const pageCount = this.doc.getNumberOfPages()
        const pageWidth = this.doc.internal.pageSize.getWidth()
        const pageHeight = this.doc.internal.pageSize.getHeight()

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i)
            this.doc.setFontSize(8)
            this.doc.setFont('helvetica', 'normal')
            this.doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            )
            this.doc.text(
                `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
                pageWidth - 15,
                pageHeight - 10,
                { align: 'right' }
            )
        }
    }

    private formatStatus(status: string): string {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    private formatSeverity(severity: string): string {
        return severity.charAt(0).toUpperCase() + severity.slice(1)
    }

    private formatIssueStatus(status: string): string {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }
}

// Export a singleton instance
export const pdfGenerator = new PDFGenerator()
