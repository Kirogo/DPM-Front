import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { PrintableReport } from '@/components/reports/ReportPrint/PrintableReport'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { PDFGenerator } from '@/services/pdf/pdfGenerator'
import toast from 'react-hot-toast'

export const ReportPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentReport, loadReport, isLoading } = useReports()
  const [isExporting, setIsExporting] = React.useState(false)
  const printTriggered = useRef(false)

  useEffect(() => {
    if (id) {
      loadReport(id)
    }
  }, [id, loadReport])

  useEffect(() => {
    // Auto-trigger print when report is loaded
    if (currentReport && !printTriggered.current) {
      printTriggered.current = true
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [currentReport])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    if (!currentReport) return
    
    setIsExporting(true)
    try {
      await PDFGenerator.downloadReport(currentReport)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBack = () => {
    navigate(`/rm/reports/${id}`)
  }

  if (isLoading || !currentReport) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Preparing report for print..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-secondary-600 hover:text-secondary-900"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Report
            </button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                }
              >
                Print Again
              </Button>
              <Button
                variant="primary"
                onClick={handleExportPDF}
                isLoading={isExporting}
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrintableReport report={currentReport} />
      </div>

      {/* Print Instructions */}
      <div className="print:hidden text-center py-4 text-sm text-secondary-500">
        <p>Use your browser's print function (Ctrl+P) or click the Print button above.</p>
      </div>
    </div>
  )
}

export default ReportPrint