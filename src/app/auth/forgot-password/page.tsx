'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

// ── FORGOT PASSWORD ───────────────────────────────────────────
const forgotSchema = z.object({ email: z.string().email('Enter a valid email address') })
type ForgotData = z.infer<typeof forgotSchema>

function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async (data: ForgotData) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', data)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          If an account exists with that email, we sent a password reset link. It expires in 1 hour.
        </p>
        <Link href="/auth/login" className="text-sm text-green-600 hover:underline">Back to sign in</Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-navy-900 mb-2">Reset your password</h1>
      <p className="text-sm text-gray-400 mb-7 leading-relaxed">
        Enter your email address and we will send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Button type="submit" fullWidth loading={loading} size="lg">Send reset link</Button>
      </form>
      <div className="mt-5 text-center">
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-navy-900">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </>
  )
}

// ── RESET PASSWORD ────────────────────────────────────────────
const resetSchema = z.object({
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'One uppercase letter').regex(/[0-9]/, 'One number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type ResetData = z.infer<typeof resetSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ResetData>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (data: ResetData) => {
    if (!token) { toast.error('Invalid reset link'); return }
    setLoading(true)
    try {
      await axios.put('/api/auth/forgot-password', { token, password: data.password })
      toast.success('Password reset successfully!')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-navy-900 mb-2">Set a new password</h1>
      <p className="text-sm text-gray-400 mb-7">Choose a strong password for your Nolance account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input label="New password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" error={errors.password?.message} {...register('password')} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-gray-400">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input label="Confirm password" type={showPw ? 'text' : 'password'} placeholder="Repeat your password" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" fullWidth loading={loading} size="lg">Reset password</Button>
      </form>
    </>
  )
}

// ── PAGE WRAPPERS ─────────────────────────────────────────────
function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-card">
        <Link href="/" className="flex justify-center mb-6">
          <span className="text-xl font-semibold text-navy-900">Nol<span className="text-green-500">ance</span></span>
        </Link>
        {children}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return <AuthCard><ForgotPasswordForm /></AuthCard>
}
