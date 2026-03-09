import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { authApi } from '@/services/api/authApi'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await authApi.requestPasswordReset(data)
      setIsSubmitted(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-secondary-900">Check your email</h3>
        <p className="text-sm text-secondary-600">
          We've sent a password reset link to your email address.
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Reset password</h2>
        <p className="mt-2 text-sm text-secondary-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Send reset link
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword