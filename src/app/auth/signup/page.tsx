'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserRole } from '@/types'
import axios from 'axios'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['buyer', 'seller', 'both'] as const),
  country: z.string().optional(),
  terms: z.boolean().refine(v => v, 'You must agree to the terms'),
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'buyer' },
  })

  const selectedRole = watch('role')
  const password = watch('password') || ''

  const passwordChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/signup', data)
      setSuccess(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-card">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-navy-900 mb-3">Check your inbox!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            We sent a verification link and 6-digit code to your email. Verify your email to activate your Nolance account.
          </p>
          <Link href="/auth/verify-email">
            <Button fullWidth>Enter verification code</Button>
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Did not receive it? Check your spam folder or{' '}
            <button className="text-green-600 hover:underline">resend email</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-12">
        <Link href="/">
          <span className="text-2xl font-semibold text-white">Nol<span className="text-green-500">ance</span></span>
        </Link>
        <div>
          <h2 className="text-4xl font-semibold text-white leading-tight mb-6">
            Join the world's greatest freelancing platform
          </h2>
          <div className="space-y-4">
            {[
              { icon: '💰', text: 'Sellers keep 85% — only 15% commission' },
              { icon: '⚡', text: 'Top sellers get paid in just 24 hours' },
              { icon: '🛡️', text: 'Every transaction protected by escrow' },
              { icon: '🤝', text: 'Real human support for every dispute' },
              { icon: '🌍', text: 'Withdraw to any Nigerian or global bank' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-gray-300 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">Built by Joshua Eniola · © {new Date().getFullYear()} Nolance</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="flex justify-center mb-8 lg:hidden">
            <span className="text-2xl font-semibold text-navy-900">Nol<span className="text-green-500">ance</span></span>
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            <h1 className="text-2xl font-semibold text-navy-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-400 mb-7">Free forever. No credit card required.</p>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="input-label">I want to</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'buyer', label: 'Hire', desc: 'Find talent' },
                  { value: 'seller', label: 'Sell', desc: 'Offer services' },
                  { value: 'both', label: 'Both', desc: 'Hire & sell' },
                ] as { value: UserRole; label: string; desc: string }[]).map(opt => (
                  <label key={opt.value}
                    className={`border-2 rounded-xl p-3 text-center cursor-pointer transition-all ${
                      selectedRole === opt.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <input type="radio" value={opt.value} {...register('role')} className="sr-only" />
                    <p className="text-sm font-medium text-navy-900">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Username"
                placeholder="yourname"
                error={errors.username?.message}
                hint="Letters, numbers, and underscores only"
                {...register('username')}
              />

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordChecks.map(c => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.ok ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {c.ok && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={`text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" {...register('terms')}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500" />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/legal/terms" className="text-green-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/legal/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
              {errors.terms && <p className="input-error-msg">{errors.terms.message}</p>}

              <Button type="submit" fullWidth loading={loading} size="lg">
                Create account
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-base">🔵</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-base">🍎</span> Apple
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
