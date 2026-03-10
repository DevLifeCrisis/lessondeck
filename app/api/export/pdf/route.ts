import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLessonPlan } from '@/lib/storage'

/**
 * Server-side HTML sanitizer — allowlist approach.
 * Strips all tags not in the allowlist and removes dangerous attributes
 * (onclick, onerror, javascript: hrefs, etc.) to prevent XSS in PDF renders.
 */
function sanitizeHtml(html: string): string {
  // Allowed tags for lesson plan output
  const allowedTags = new Set([
    'h1','h2','h3','h4','h5','h6',
    'p','br','hr',
    'strong','b','em','i','u','s','mark',
    'ul','ol','li',
    'table','thead','tbody','tr','th','td',
    'div','span','section','article',
    'blockquote','pre','code',
  ])

  // Remove all script/style/iframe/object/embed blocks entirely (including content)
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')

  // Strip any tag not in the allowlist (keep content, remove tag)
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName: string) => {
    if (allowedTags.has(tagName.toLowerCase())) {
      // Strip dangerous attributes from allowed tags
      return match
        .replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '')   // event handlers
        .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
        .replace(/href\s*=\s*(['"])?\s*javascript:[^'">\s]*/gi, 'href="#"')
        .replace(/src\s*=\s*(['"])?\s*javascript:[^'">\s]*/gi, '')
        .replace(/data\s*=\s*(['"])[^'"]*\1/gi, '')        // data: URLs
    }
    return '' // Strip disallowed tag entirely (keep text content via closing tag removal)
  })

  return clean
}

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

    // Sanitize HTML before returning for client-side PDF render
    const sanitized = sanitizeHtml(content)

    // Return the HTML content for client-side PDF generation
    // The client will use jsPDF + html2canvas
    return NextResponse.json({ htmlContent: sanitized, success: true })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
