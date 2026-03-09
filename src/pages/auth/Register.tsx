import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const nameParts = data.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User'

      await registerUser({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        role: 'Admin'
      } as any)
      navigate('/login')
    } catch (error) {
      // Error is handled by the hook
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">Admin Registration</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full name"
          type="text"
          {...register('name')}
          error={errors.name?.message}
          placeholder="John Doe"
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Input
          label="Confirm password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            {...register('terms')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-secondary-700">
            I agree to the{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Terms and Conditions
            </a>
          </label>
        </div>
        {errors.terms && (
          <p className="text-sm text-error">{errors.terms.message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Register
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-secondary-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Login here
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Register
