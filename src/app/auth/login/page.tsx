'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import axios from 'axios'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', data)
      const { user, token } = res.data.data
      setUser(user)
      setToken(token)
      // Set cookie for middleware
      document.cookie = `nolance-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      toast.success(`Welcome back, ${user.username}!`)
      router.push(redirect)
    } catch (err: any) {
      const code = err?.response?.data?.code
      const message = err?.response?.data?.error || 'Invalid email or password'
      if (code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first')
        router.push('/auth/verify-email')
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
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
            Welcome back to the world's greatest freelancing platform
          </h2>
          <div className="space-y-3">
            {[
              'Access your Gigs, Scout, Marketplace, Community, and Directory',
              'Track your orders and earnings in real time',
              'Message clients and sellers instantly',
              'Withdraw to any bank in Nigeria or globally',
            ].map(text => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <p className="text-gray-300 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Nolance · Built by Joshua Eniola</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex justify-center mb-8 lg:hidden">
            <span className="text-2xl font-semibold text-navy-900">Nol<span className="text-green-500">ance</span></span>
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            <h1 className="text-2xl font-semibold text-navy-900 mb-1">Sign in to Nolance</h1>
            <p className="text-sm text-gray-400 mb-7">Welcome back — your platform is waiting</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="input-label mb-0">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-green-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="input-error-msg">{errors.password.message}</p>}
              </div>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Sign in
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span>🔵</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span>🍎</span> Apple
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-green-600 font-medium hover:underline">Join free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
