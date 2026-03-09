import React, { useEffect, useState } from 'react'
import { isStatus } from '@/utils/status'
import { useParams, useNavigate } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { ReportForm } from '@/components/reports/ReportForm/ReportForm'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { CreateReportDto } from '@/types/report.types'
import { GeotaggedPhoto } from '@/types/geotag.types'
import toast from 'react-hot-toast'

export const EditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentReport, loadReport, saveReport, uploadPhotos, isLoading } = useReports()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialPhotos, setInitialPhotos] = useState<GeotaggedPhoto[]>([])

  useEffect(() => {
    if (id) {
      loadReport(id)
    }
  }, [id, loadReport])

  useEffect(() => {
    if (currentReport?.photos) {
      // Convert existing photos to GeotaggedPhoto format
      const photos: GeotaggedPhoto[] = currentReport.photos.map(p => ({
        id: p.id,
        file: new File([], p.url), // This is a placeholder - in reality you'd need the actual file
        url: p.url,
        thumbnailUrl: p.thumbnailUrl || p.url,
        geotag: p.geotag || {
          latitude: 0,
          longitude: 0,
          timestamp: new Date(p.uploadedAt),
        },
        uploadedAt: new Date(p.uploadedAt),
      }))
      setInitialPhotos(photos)
    }
  }, [currentReport])

  const handleSubmit = async (data: CreateReportDto, newPhotos: File[]) => {
    if (!id) return

    setIsSubmitting(true)
    try {
      // Update report details
      await saveReport({
        id,
        ...data,
      })

      // Upload any new photos
      if (newPhotos.length > 0) {
        // Convert files to geotagged photos
        const geotaggedPhotos = await Promise.all(
          newPhotos.map(async (file) => {
            return {
              id: Math.random().toString(),
              file,
              url: URL.createObjectURL(file),
              geotag: {
                latitude: 0,
                longitude: 0,
                timestamp: new Date(),
              },
              uploadedAt: new Date(),
            }
          })
        )
        
        await uploadPhotos(id, geotaggedPhotos)
      }

      toast.success('Report updated successfully!')
      navigate(`/rm/reports/${id}`)
    } catch (error) {
      toast.error('Failed to update report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/rm/reports/${id}`)
  }

  if (isLoading || !currentReport) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading report..." />
      </div>
    )
  }

  // Check if report can be edited
  if (!isStatus(currentReport.status, 'draft') && !isStatus(currentReport.status, 'revision_requested')) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-warning"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-secondary-900">
              Report Cannot Be Edited
            </h3>
            <p className="mt-2 text-sm text-secondary-500">
              This report is currently {currentReport.status.replace(/_/g, ' ')} and cannot be edited.
              {isStatus(currentReport.status, 'revision_requested') && ' Please address the revision requests.'}
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => navigate(`/rm/reports/${id}`)}
            >
              View Report
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Edit Report</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Update the site visit report details below.
          {isStatus(currentReport.status, 'revision_requested') && (
            <span className="ml-2 text-warning font-medium">
              This report requires revisions
            </span>
          )}
        </p>
      </div>

      {/* Revision Request Info */}
      {isStatus(currentReport.status, 'revision_requested') && currentReport.decisions && (
        <Card className="bg-warning/5 border-warning/20">
          <h3 className="text-lg font-medium text-warning mb-2">
            Revision Requested
          </h3>
          {currentReport.decisions
            .filter(d => d.decision === 'revision')
            .slice(-1)
            .map(decision => (
              <div key={decision.id} className="space-y-2">
                <p className="text-sm text-secondary-700">{decision.comment}</p>
                {decision.attachments && decision.attachments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-secondary-500 mb-1">
                      Required Changes:
                    </p>
                    <ul className="list-disc list-inside text-sm text-secondary-600">
                      {decision.attachments.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-secondary-400 mt-2">
                  Requested by {decision.madeBy} on{' '}
                  {new Date(decision.madeAt).toLocaleDateString()}
                </p>
              </div>
            ))}
        </Card>
      )}

      {/* Edit Form */}
      <Card>
        <ReportForm
          initialData={{
            title: currentReport.title,
            description: currentReport.description,
            clientId: currentReport.clientId,
            visitDate: new Date(currentReport.visitDate).toISOString().split('T')[0],
            siteAddress: currentReport.siteAddress,
            weather: currentReport.weather,
            temperature: currentReport.temperature,
            workProgress: currentReport.workProgress,
            issues: currentReport.issues,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  )
}

export default EditReport