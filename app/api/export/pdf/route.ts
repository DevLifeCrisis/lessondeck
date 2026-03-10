import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLessonPlan } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, htmlContent } = await req.json() as { planId?: string; htmlContent?: string }

    let content = htmlContent

    if (planId && !content) {
      const plan = await getLessonPlan(session.user.id, planId)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }
      content = plan.htmlContent
    }

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    // Return the HTML content for client-side PDF generation
    // The client will use jsPDF + html2canvas
    return NextResponse.json({ htmlContent: content, success: true })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
