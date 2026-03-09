import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { reportsApi } from '@/services/api/reportsApi'
import { Comment } from '@/types/report.types'
import { Button } from '@/components/common/Button'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface CommentSectionProps {
  reportId: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({ reportId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [reportId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await reportsApi.getComments(reportId)
      setComments(response.data)
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await reportsApi.addComment(reportId, {
        content: newComment,
      })
      setComments([response.data, ...comments])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-secondary-500 py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-700">
                    {comment.createdBy?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-secondary-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-secondary-900">
                    {comment.createdBy}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-1 text-sm text-secondary-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 flex space-x-2">
                    {comment.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}