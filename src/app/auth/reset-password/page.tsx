'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import axios from 'axios'
import toast from 'react-hot-toast'

const schema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password') || ''
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Invalid reset link. Please request a new one.'); return }
    setLoading(true)
    try {
      await axios.put('/api/auth/forgot-password', { token, password: data.password })
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Reset failed. The link may have expired.')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-card text-center">
          <p className="text-4xl mb-4">🔗</p>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Invalid reset link</h2>
          <p className="text-sm text-gray-400 mb-5">This reset link is invalid or has expired.</p>
          <Link href="/auth/forgot-password"><Button fullWidth>Request a new link</Button></Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Password reset!</h2>
          <p className="text-sm text-gray-400">Redirecting you to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-card">
        <Link href="/" className="flex justify-center mb-6">
          <span className="text-xl font-semibold text-navy-900">Nol<span className="text-green-500">ance</span></span>
        </Link>
        <h1 className="text-2xl font-semibold text-navy-900 mb-1">Set a new password</h1>
        <p className="text-sm text-gray-400 mb-6">Choose a strong password for your Nolance account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label">New password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 8 characters" {...register('password')} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="input-error-msg">{errors.password.message}</p>}
            {password && (
              <div className="mt-2 space-y-1">
                {checks.map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.ok ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {c.ok && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="input-label">Confirm password</label>
            <input type={showPw ? 'text' : 'password'} className={`input ${errors.confirm ? 'input-error' : ''}`}
              placeholder="Repeat your password" {...register('confirm')} />
            {errors.confirm && <p className="input-error-msg">{errors.confirm.message}</p>}
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">Reset password</Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link href="/auth/login" className="text-green-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
