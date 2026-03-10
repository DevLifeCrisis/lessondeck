import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateLessonPlan } from '@/lib/ai'
import { canCreatePlan, incrementPlansUsed, saveLessonPlan, getUserProfile } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { grade, subject, standardsState, topic, duration, save } = await req.json() as {
      grade: string
      subject: string
      standardsState: string
      topic: string
      duration?: string
      save?: boolean
    }

    if (!grade || !subject || !standardsState || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get fresh profile data
    const profile = await getUserProfile(session.user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is admin (admins have unlimited plans)
    if (profile.role !== 'admin') {
      const { allowed, reason } = await canCreatePlan(session.user.id)
      if (!allowed) {
        return NextResponse.json({ error: reason }, { status: 403 })
      }
    }

    // Generate lesson plan
    const generated = await generateLessonPlan({ grade, subject, standardsState, topic, duration })

    // Save to storage if requested
    let savedPlan = null
    if (save !== false) {
      savedPlan = await saveLessonPlan({
        userId: session.user.id,
        title: generated.title,
        grade,
        subject,
        standardsState,
        topic,
        objectives: generated.objectives,
        materials: generated.materials,
        activities: generated.activities,
        assessment: generated.assessment,
        differentiation: generated.differentiation,
        duration: generated.duration,
        htmlContent: generated.htmlContent,
      })

      // Increment usage counter (not for admins)
      if (profile.role !== 'admin') {
        const MONTHLY_LIMIT = 15
        if (profile.plansUsedThisMonth < MONTHLY_LIMIT) {
          await incrementPlansUsed(session.user.id)
        } else {
          // Use burst plan
          const { supabaseAdmin } = await import('@/lib/supabase')
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(session.user.id)
          const meta = user?.user_metadata as Record<string, unknown>
          await supabaseAdmin.auth.admin.updateUserById(session.user.id, {
            user_metadata: {
              ...meta,
              burstPlans: Math.max(0, ((meta.burstPlans as number) || 0) - 1),
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      plan: {
        ...generated,
        id: savedPlan?.id,
      }
    })
  } catch (err) {
    const error = err as Error
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
