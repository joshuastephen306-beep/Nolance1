'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Check, Mail } from 'lucide-react'
import axios from 'axios'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-verify via token link
  useEffect(() => {
    if (token) {
      verifyWithToken(token)
    }
  }, [token])

  const verifyWithToken = async (t: string) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-email', { token: t })
      setVerified(true)
      toast.success('Email verified successfully!')
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch {
      toast.error('Invalid or expired link. Please enter the code manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...code]
    next[i] = value.slice(-1)
    setCode(next)
    if (value && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerify(next.join(''))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      handleVerify(pasted)
    }
  }

  const handleVerify = async (codeStr: string) => {
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-email', { code: codeStr })
      setVerified(true)
      toast.success('Email verified! Redirecting to login...')
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid code. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    const email = prompt('Enter your email address to resend the verification code:')
    if (!email) return
    setResending(true)
    try {
      await axios.put('/api/auth/verify-email', { email })
      toast.success('Verification email sent! Check your inbox.')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-card">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse-green">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Email verified!</h2>
          <p className="text-sm text-gray-400">Redirecting you to login...</p>
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

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-navy-700" />
          </div>
          <h1 className="text-2xl font-semibold text-navy-900 mb-2">Verify your email</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            We sent a 6-digit code to your email address. Enter it below to activate your account.
          </p>
        </div>

        {/* Code Input */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-navy-900"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button
          fullWidth
          loading={loading}
          disabled={code.some(d => !d)}
          onClick={() => handleVerify(code.join(''))}
          size="lg"
        >
          Verify email
        </Button>

        <div className="text-center mt-5 space-y-2">
          <p className="text-sm text-gray-400">
            Did not receive the code?{' '}
            <button onClick={handleResend} disabled={resending}
              className="text-green-600 font-medium hover:underline disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend email'}
            </button>
          </p>
          <Link href="/auth/login" className="block text-sm text-gray-400 hover:text-navy-900">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
