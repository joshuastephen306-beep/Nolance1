import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
  userRole?: string
  userEmail?: string
}

export async function authenticate(req: NextRequest): Promise<{ userId: string; role: string; email: string } | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string; email: string }

    // Verify session is still active
    const supabase = createClient()
    const { data: session } = await supabase
      .from('login_sessions')
      .select('id')
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session) return null
    return payload
  } catch {
    return null
  }
}

export function requireAuth(handler: (req: NextRequest, auth: { userId: string; role: string; email: string }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = await authenticate(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }
    return handler(req, auth)
  }
}

export function requireSeller(handler: (req: NextRequest, auth: { userId: string; role: string; email: string }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'seller' && auth.role !== 'both' && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Seller account required' }, { status: 403 })
    }
    return handler(req, auth)
  }
}

export function requireAdmin(handler: (req: NextRequest, auth: { userId: string; role: string; email: string }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    return handler(req, auth)
  }
}
