import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserProfile } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(session.user.id)
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, status } = await req.json() as { userId: string; status: string }
    
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
    const meta = user?.user_metadata as Record<string, unknown>
    
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        subscriptionStatus: status,
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
