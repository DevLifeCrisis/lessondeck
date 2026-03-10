import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile, updateUserProfile } from '@/lib/storage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(session.user.id)
    return NextResponse.json({ profile })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await req.json() as Record<string, string | number | boolean>
    
    // Only allow safe updates — subscriptionStatus and burstPlans must ONLY be set server-side via admin/webhook
    const allowedFields = ['name']
    const safeUpdates: Record<string, string | number | boolean> = {}
    for (const key of allowedFields) {
      if (key in updates) {
        safeUpdates[key] = updates[key]
      }
    }

    await updateUserProfile(session.user.id, safeUpdates)
    const profile = await getUserProfile(session.user.id)
    return NextResponse.json({ profile })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
