import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateLessonPlan } from '@/lib/ai'
import { canCreatePlan, incrementPlansUsed, saveLessonPlan, getUserProfile } from '@/lib/storage'
import { rateLimit, getRequestIdentifier } from '@/lib/rateLimit'

// Input length limits
const MAX_TOPIC_LEN = 500
const MAX_FIELD_LEN = 100

function sanitizeField(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, '').substring(0, maxLen).trim()
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 20 generations per hour per IP
    const identifier = getRequestIdentifier(req, 'generate')
    const rl = rateLimit(identifier, { limit: 20, windowMs: 60 * 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as Record<string, unknown>

    // Sanitize + validate all AI prompt fields
    const grade = sanitizeField(body.grade, MAX_FIELD_LEN)
    const subject = sanitizeField(body.subject, MAX_FIELD_LEN)
    const standardsState = sanitizeField(body.standardsState, MAX_FIELD_LEN)
    const topic = sanitizeField(body.topic, MAX_TOPIC_LEN)
    const duration = body.duration ? sanitizeField(body.duration, MAX_FIELD_LEN) : undefined
    const save = body.save !== false

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
    if (save) {
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
