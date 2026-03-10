import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserProfile } from '@/lib/storage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin
    const profile = await getUserProfile(session.user.id)
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100,
    })

    if (error) throw error

    const enrichedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email?.split('@')[0],
      role: u.user_metadata?.role || 'teacher',
      subscriptionStatus: u.user_metadata?.subscriptionStatus || 'inactive',
      plansUsedThisMonth: u.user_metadata?.plansUsedThisMonth || 0,
      burstPlans: u.user_metadata?.burstPlans || 0,
      createdAt: u.created_at,
    }))

    return NextResponse.json({ users: enrichedUsers })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
