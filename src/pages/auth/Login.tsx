// src/pages/auth/Login.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ConstructionDoodles } from '@/components/common/ConstructionDoodles';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login page - Auth state:', { 
      isAuthenticated, 
      user,
      userRole: user?.role,
      path: window.location.pathname 
    });

    if (isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      console.log('User authenticated, redirecting based on role:', role);
      
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'qs') {
        navigate('/qs', { replace: true });
      } else if (role === 'rm') {
        navigate('/rm', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = '';
    document.body.style.display = '';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.display = '';
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white"  style={{ fontFamily: 'Century Gothic, CenturyGothic, AppleGothic, sans-serif' }}>
      {/* Left Panel - 65% on desktop */}
      <div className="hidden lg:flex lg:w-[65%] relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1A3636] to-[#40534C]">
        <div className="absolute inset-0 opacity-20">
          <ConstructionDoodles />
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8 lg:p-12">
          <div className="max-w-md text-center">
            <h1 className="text-4xl lg:text-5xl font-light mb-4 tracking-tight">
              Geo<span className="font-semibold text-[#D6BD98]">Build</span>
            </h1>
             <p className="text-base lg:text-lg opacity-80 leading-relaxed">
              Digitized Project Monitoring System
            </p>
          </div>
        </div>
        
        {/* Bottom Attribution */}
        <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 text-center text-xs lg:text-sm text-white/60">
          © 2026 NCBA Bank · All rights reserved 
        </div>
      </div>

      {/* Right Panel - 35% on desktop */}
      <div className="w-full lg:w-[35%] flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6 lg:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-light text-[#1A3636]">
              Geo<span className="font-semibold text-[#677D6A]">Build</span>
            </h1>
            <p className="mt-2 text-sm text-[#3B4953]/60">
              Digitized Project Monitoring System
            </p>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-1xl sm:text-2xl font-light text-[#3B4953]">
              Welcome, <span className="font-semibold text-[#5A7863]">Sign In</span>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#1A3636] mb-1 sm:mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-[#677D6A]/30 bg-white/50 
                         focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-transparent
                         placeholder:text-[#40534C]/30 transition-all duration-200
                         text-[#1A3636]"
                placeholder="architect@firm.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-[#D6BD98]">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#1A3636] mb-1 sm:mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-[#677D6A]/30 bg-white/50
                         focus:outline-none focus:ring-2 focus:ring-[#40534C] focus:border-transparent
                         placeholder:text-[#40534C]/30 transition-all duration-200
                         text-[#1A3636]"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-[#D6BD98]">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-[#677D6A]/30 text-[#40534C] 
                           focus:ring-[#40534C] focus:ring-offset-0"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-[#40534C]/70">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm font-medium text-[#677D6A] hover:text-[#1A3636] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#40534C] hover:bg-[#1A3636] text-white py-3 sm:py-3.5 px-4 rounded-xl
                       font-medium text-sm sm:text-base transition-all duration-200 
                       active:scale-[0.98] hover:scale-[1.02] transform
                       focus:outline-none focus:ring-2 focus:ring-[#677D6A] focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#677D6A]/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-[#40534C]/40">
                  Secure access
                </span>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-xs sm:text-sm text-[#40534C]/60">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#677D6A] hover:text-[#1A3636] transition-colors"
              >
                Contact administrator
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;