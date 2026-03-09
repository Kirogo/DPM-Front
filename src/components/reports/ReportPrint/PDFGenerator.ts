import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SiteVisitReport } from '@/types/report.types'
import { formatDate, formatDateTime } from '@/utils/formatters/dateFormatter'

export class PDFGenerator {
  /**
   * Generate a PDF report from a site visit report
   */
  static async generateReport(report: SiteVisitReport): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Add metadata
    doc.setProperties({
      title: `Site Visit Report - ${report.reportNumber}`,
      subject: 'Site Visit Report',
      author: report.rm ? `${report.rm.firstName} ${report.rm.lastName}` : 'GeoBuild System',
      keywords: 'site visit, construction, report',
      creator: 'GeoBuild'
    })

    // Add header
    this.addHeader(doc, report)

    // Add client information
    this.addClientInfo(doc, report)

    // Add visit details
    this.addVisitDetails(doc, report)

    // Add description
    if (report.description) {
      this.addDescription(doc, report.description)
    }

    // Add work progress
    if (report.workProgress && report.workProgress.length > 0) {
      this.addWorkProgress(doc, report.workProgress)
    }

    // Add issues
    if (report.issues && report.issues.length > 0) {
      this.addIssues(doc, report.issues)
    }

    // Add photos (new page)
    if (report.photos && report.photos.length > 0) {
      doc.addPage()
      this.addPhotos(doc, report.photos)
    }

    // Add decisions history
    if (report.decisions && report.decisions.length > 0) {
      this.addDecisions(doc, report.decisions)
    }

    // Add signature section if approved
    if (report.status === 'approved') {
      this.addSignatures(doc, report)
    }

    // Add footer with page numbers
    this.addFooter(doc)

    return doc
  }

  /**
   * Download report as PDF
   */
  static async downloadReport(report: SiteVisitReport, filename?: string) {
    const doc = await this.generateReport(report)
    doc.save(filename || `report-${report.reportNumber}.pdf`)
  }

  /**
   * Open report in new window for printing
   */
  static async printReport(report: SiteVisitReport) {
    const doc = await this.generateReport(report)
    window.open(doc.output('bloburl'), '_blank')
  }

  /**
   * Get PDF as blob
   */
  static async getBlob(report: SiteVisitReport): Promise<Blob> {
    const doc = await this.generateReport(report)
    return doc.output('blob')
  }

  private static addHeader(doc: jsPDF, report: SiteVisitReport) {
    // Company logo/name
    doc.setFontSize(24)
    doc.setTextColor(59, 130, 246) // primary-600
    doc.text('GeoBuild', 14, 20)

    // Report title
    doc.setFontSize(20)
    doc.setTextColor(31, 41, 55) // secondary-900
    doc.text('Site Visit Report', 14, 35)

    // Report number and status
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // secondary-500

    const statusColors = {
      draft: [107, 114, 128],
      pending_qs_review: [245, 158, 11],
      under_review: [59, 130, 246],
      revision_requested: [239, 68, 68],
      site_visit_scheduled: [139, 92, 246],
      approved: [16, 185, 129],
      rejected: [239, 68, 68],
      archived: [107, 114, 128],
    }

    const color = statusColors[report.status] || [107, 114, 128]

    // Right-aligned status
    doc.setTextColor(color[0], color[1], color[2])
    doc.text(
      report.status.toUpperCase().replace(/_/g, ' '),
      doc.internal.pageSize.width - 14,
      35,
      { align: 'right' }
    )

    doc.setTextColor(107, 114, 128)
    doc.text(`Report #: ${report.reportNumber}`, 14, 45)
    doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 50)

    // Separator line
    doc.setDrawColor(229, 231, 235)
    doc.line(14, 55, doc.internal.pageSize.width - 14, 55)
  }

  private static addClientInfo(doc: jsPDF, report: SiteVisitReport) {
    let yPos = 65

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Client Information', 14, yPos)

    yPos += 8

    const clientData = [
      ['Client Name:', report.client?.name || 'N/A'],
      ['Customer #:', report.client?.customerNumber || 'N/A'],
      ['Project:', report.client?.projectName || 'N/A'],
      ['Contact:', report.client?.contactPerson || 'N/A'],
      ['Email:', report.client?.email || 'N/A'],
      ['Phone:', report.client?.phone || 'N/A'],
    ]

    autoTable(doc, {
      startY: yPos,
      body: clientData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14 },
    })

    return (doc as any).lastAutoTable.finalY + 10
  }

  private static addVisitDetails(doc: jsPDF, report: SiteVisitReport) {
    const yPos = (doc as any).lastAutoTable?.finalY + 10 || 75

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Visit Details', 14, yPos)

    const detailsData = [
      ['Visit Date:', formatDate(report.visitDate)],
      ['Site Address:', report.siteAddress],
      ['Weather:', report.weather || 'Not recorded'],
      ['Temperature:', report.temperature ? `${report.temperature}°C` : 'Not recorded'],
      ['RM:', report.rm ? `${report.rm.firstName} ${report.rm.lastName}` : 'N/A'],
      ['QS:', report.qs ? `${report.qs.firstName} ${report.qs.lastName}` : 'Not assigned'],
    ]

    autoTable(doc, {
      startY: yPos + 5,
      body: detailsData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 14 },
    })
  }

  private static addDescription(doc: jsPDF, description: string) {
    const yPos = (doc as any).lastAutoTable?.finalY + 10 || 75

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Description', 14, yPos)

    doc.setFontSize(10)
    doc.setTextColor(75, 85, 99)

    const splitText = doc.splitTextToSize(description, doc.internal.pageSize.width - 28)
    doc.text(splitText, 14, yPos + 8)

      // Update last Y position
      ; (doc as any).lastAutoTable = { finalY: yPos + 8 + (splitText.length * 5) }
  }

  private static addWorkProgress(doc: jsPDF, workProgress: any[]) {
    const yPos = (doc as any).lastAutoTable?.finalY + 10 || 75

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Work Progress', 14, yPos)

    const progressData = workProgress.map(w => [
      w.category,
      w.description,
      `${w.percentage}%`,
      w.notes || '',
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Category', 'Description', 'Progress', 'Notes']],
      body: progressData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })
  }

  private static addIssues(doc: jsPDF, issues: any[]) {
    const yPos = (doc as any).lastAutoTable?.finalY + 10 || 75

    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 60) {
      doc.addPage()
    }

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Issues', 14, yPos)

    const issueData = issues.map(i => [
      i.title,
      i.severity,
      i.status,
      i.description,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Issue', 'Severity', 'Status', 'Description']],
      body: issueData,
      theme: 'striped',
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })
  }

  private static addPhotos(doc: jsPDF, photos: any[]) {
    doc.setFontSize(16)
    doc.setTextColor(31, 41, 55)
    doc.text('Site Photos', 14, 20)

    let yPos = 30
    const photosPerRow = 2
    const photoWidth = 85
    const photoHeight = 60
    const spacing = 10

    photos.forEach((photo, index) => {
      const row = Math.floor(index / photosPerRow)
      const col = index % photosPerRow

      const x = 14 + col * (photoWidth + spacing)
      const y = yPos + row * (photoHeight + 25)

      // Check if we need a new page
      if (y + photoHeight > doc.internal.pageSize.height - 20) {
        doc.addPage()
        yPos = 20
      }

      // Photo frame
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(x, y, photoWidth, photoHeight, 3, 3, 'FD')

      // Photo placeholder text
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Photo', x + photoWidth / 2, y + photoHeight / 2, { align: 'center' })

      // Caption
      doc.setFontSize(8)
      doc.setTextColor(75, 85, 99)
      const caption = photo.caption || `Photo ${index + 1}`
      doc.text(caption, x, y + photoHeight + 5)

      // Geotag info
      if (photo.geotag?.latitude && photo.geotag?.longitude) {
        doc.setFontSize(6)
        doc.setTextColor(107, 114, 128)
        doc.text(
          `📍 ${photo.geotag.latitude.toFixed(6)}, ${photo.geotag.longitude.toFixed(6)}`,
          x,
          y + photoHeight + 10
        )
      }

      // Date
      if (photo.uploadedAt) {
        doc.setFontSize(6)
        doc.setTextColor(107, 114, 128)
        doc.text(
          `📅 ${formatDate(new Date(photo.uploadedAt))}`,
          x + photoWidth - 30,
          y + photoHeight + 10
        )
      }
    })
  }

  private static addDecisions(doc: jsPDF, decisions: any[]) {
    doc.addPage()

    doc.setFontSize(16)
    doc.setTextColor(31, 41, 55)
    doc.text('Review History', 14, 20)

    const decisionData = decisions.map(d => [
      d.decision.toUpperCase(),
      d.madeBy,
      formatDateTime(new Date(d.madeAt)),
      d.comment,
    ])

    autoTable(doc, {
      startY: 30,
      head: [['Decision', 'Reviewer', 'Date', 'Comments']],
      body: decisionData,
      theme: 'striped',
      headStyles: {
        fillColor: [75, 85, 99],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    })
  }

  private static addSignatures(doc: jsPDF, report: SiteVisitReport) {
    const yPos = (doc as any).lastAutoTable?.finalY + 20 || doc.internal.pageSize.height - 40

    doc.setDrawColor(0, 0, 0)

    // QS Signature
    doc.line(14, yPos, 80, yPos)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('QS Signature', 14, yPos + 5)
    if (report.qs) {
      doc.text(`${report.qs.firstName} ${report.qs.lastName}`, 14, yPos + 10)
    }

    // RM Signature
    doc.line(120, yPos, 186, yPos)
    doc.text('RM Signature', 120, yPos + 5)
    if (report.rm) {
      doc.text(`${report.rm.firstName} ${report.rm.lastName}`, 120, yPos + 10)
    }

    // Date
    if (report.approvedAt) {
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(`Approved on: ${formatDateTime(new Date(report.approvedAt))}`, 14, yPos + 20)
    }
  }

  private static addFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)

      // Left footer
      doc.text(
        'Generated by GeoBuild - Official Site Visit Report',
        14,
        doc.internal.pageSize.height - 10
      )

      // Right footer with page number
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      )

      // Footer line
      doc.setDrawColor(229, 231, 235)
      doc.line(
        14,
        doc.internal.pageSize.height - 15,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 15
      )
    }
  }
}

// Add type declaration for jspdf with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}