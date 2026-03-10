import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PptxGenJS from 'pptxgenjs'
import type { LessonPlan } from '@/lib/storage'

const DARK_BG = '0f1117'
const LIGHT_BG = 'ffffff'
const VIOLET = '7c3aed'
const VIOLET_LIGHT = 'a78bfa'
const WHITE = 'ffffff'
const DARK_TEXT = '1e1b4b'
const GRAY = '94a3b8'

function truncateToBullets(text: string, maxBullets = 4): string[] {
  const lines = text
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  if (lines.length <= maxBullets) return lines

  // Collapse into maxBullets by joining overflow
  return lines.slice(0, maxBullets)
}

function getUnsplashUrl(keyword: string): string {
  const clean = encodeURIComponent(keyword.replace(/[^a-zA-Z0-9 ]/g, ' ').trim())
  return `https://source.unsplash.com/1280x720/?${clean}`
}

function safeName(title: string): string {
  return title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { lessonPlan: LessonPlan; theme?: 'dark' | 'light' }
    const { lessonPlan: plan, theme = 'dark' } = body

    if (!plan) {
      return NextResponse.json({ error: 'lessonPlan required' }, { status: 400 })
    }

    const isDark = theme === 'dark'
    const bg = isDark ? DARK_BG : LIGHT_BG
    const textColor = isDark ? WHITE : DARK_TEXT
    const subTextColor = isDark ? GRAY : '6b7280'

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches

    // ────────────────────────────────────────────────
    // SLIDE 1 — Title
    // ────────────────────────────────────────────────
    const s1 = pptx.addSlide()
    s1.background = { color: bg }

    // Violet accent bar on left
    s1.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: '100%',
      fill: { color: VIOLET },
      line: { color: VIOLET },
    })

    // Subject keyword image (right side, semi-transparent overlay)
    s1.addShape(pptx.ShapeType.rect, {
      x: 7.5, y: 0, w: 5.83, h: 7.5,
      fill: { color: isDark ? '1a0a3e' : 'ede9fe' },
      line: { color: isDark ? '1a0a3e' : 'ede9fe' },
    })

    // Decorative circles
    s1.addShape(pptx.ShapeType.ellipse, {
      x: 9.5, y: 0.5, w: 2.5, h: 2.5,
      fill: { color: VIOLET, transparency: 70 },
      line: { color: VIOLET, transparency: 70 },
    })
    s1.addShape(pptx.ShapeType.ellipse, {
      x: 10.5, y: 3.5, w: 1.8, h: 1.8,
      fill: { color: VIOLET_LIGHT, transparency: 60 },
      line: { color: VIOLET_LIGHT, transparency: 60 },
    })

    // LessonDeck badge
    s1.addText('LessonDeck', {
      x: 0.5, y: 0.35, w: 3, h: 0.4,
      fontSize: 12,
      color: VIOLET_LIGHT,
      bold: true,
      fontFace: 'Calibri',
    })

    // Main title
    s1.addText(plan.title, {
      x: 0.5, y: 1.3, w: 6.7, h: 2.8,
      fontSize: 36,
      bold: true,
      color: textColor,
      fontFace: 'Calibri',
      wrap: true,
      valign: 'middle',
    })

    // Subtitle line
    const subtitle = [plan.subject, plan.grade, plan.duration].filter(Boolean).join(' · ')
    s1.addText(subtitle, {
      x: 0.5, y: 4.3, w: 6.7, h: 0.5,
      fontSize: 16,
      color: subTextColor,
      fontFace: 'Calibri',
    })

    // Date
    s1.addText(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), {
      x: 0.5, y: 5.0, w: 4, h: 0.4,
      fontSize: 12,
      color: GRAY,
      fontFace: 'Calibri',
    })

    // Topic label on right panel
    s1.addText(plan.subject.toUpperCase(), {
      x: 7.8, y: 3.2, w: 5.2, h: 0.8,
      fontSize: 28,
      bold: true,
      color: VIOLET,
      fontFace: 'Calibri',
      align: 'center',
    })

    s1.addNotes(`Title: ${plan.title}\nSubject: ${plan.subject}\nGrade: ${plan.grade}\nDuration: ${plan.duration}`)

    // ────────────────────────────────────────────────
    // SLIDE 2 — Learning Objectives
    // ────────────────────────────────────────────────
    const s2 = pptx.addSlide()
    s2.background = { color: bg }

    // Header bar
    s2.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 1.4,
      fill: { color: VIOLET },
      line: { color: VIOLET },
    })

    s2.addText('Learning Objectives', {
      x: 0.5, y: 0.2, w: 12, h: 1,
      fontSize: 28,
      bold: true,
      color: WHITE,
      fontFace: 'Calibri',
      valign: 'middle',
    })

    // Left accent bar
    s2.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 1.7, w: 0.08, h: 5.3,
      fill: { color: VIOLET_LIGHT },
      line: { color: VIOLET_LIGHT },
    })

    const objBullets = truncateToBullets(plan.objectives, 6)
    const objRows = objBullets.map((obj, i) => ({
      text: `${i + 1}.  ${obj}`,
      options: {
        fontSize: 16,
        color: textColor,
        fontFace: 'Calibri' as const,
        paraSpaceAfter: 8,
      },
    }))

    s2.addText(objRows, {
      x: 0.8, y: 1.7, w: 11.8, h: 5.3,
      valign: 'top',
    })

    s2.addNotes(plan.objectives)

    // ────────────────────────────────────────────────
    // SLIDES 3-5 — Content sections (Materials, Activities, Differentiation)
    // ────────────────────────────────────────────────
    const sections = [
      { heading: 'Materials & Resources', content: plan.materials, keyword: `${plan.subject} classroom` },
      { heading: 'Lesson Activities', content: plan.activities, keyword: `${plan.subject} teaching` },
      { heading: 'Differentiation Strategies', content: plan.differentiation, keyword: `${plan.subject} students` },
    ]

    for (const section of sections) {
      const slide = pptx.addSlide()
      slide.background = { color: bg }

      // Left content panel (60%)
      // Section number accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.12, h: 7.5,
        fill: { color: VIOLET },
        line: { color: VIOLET },
      })

      // Section heading
      slide.addText(section.heading, {
        x: 0.4, y: 0.3, w: 7.5, h: 0.9,
        fontSize: 24,
        bold: true,
        color: isDark ? VIOLET_LIGHT : VIOLET,
        fontFace: 'Calibri',
        valign: 'middle',
      })

      // Divider line
      slide.addShape(pptx.ShapeType.line, {
        x: 0.4, y: 1.3, w: 7.5, h: 0,
        line: { color: VIOLET, width: 1.5, transparency: 50 },
      })

      // Bullet content
      const bullets = truncateToBullets(section.content, 5)
      const bulletRows = bullets.map(b => ({
        text: `•  ${b}`,
        options: {
          fontSize: 15,
          color: textColor,
          fontFace: 'Calibri' as const,
          paraSpaceAfter: 10,
        },
      }))

      slide.addText(bulletRows, {
        x: 0.4, y: 1.5, w: 7.5, h: 5.7,
        valign: 'top',
        wrap: true,
      })

      // Right image panel
      slide.addShape(pptx.ShapeType.rect, {
        x: 8.2, y: 0.5, w: 4.8, h: 6.5,
        fill: { color: isDark ? '1a0a3e' : 'ede9fe' },
        line: { color: VIOLET, transparency: 60 },
      })

      // Decorative image placeholder with subject label
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 9.2, y: 1.2, w: 2.8, h: 2.8,
        fill: { color: VIOLET, transparency: 75 },
        line: { color: VIOLET, transparency: 75 },
      })

      slide.addText(plan.subject, {
        x: 8.4, y: 3.8, w: 4.4, h: 0.7,
        fontSize: 18,
        bold: true,
        color: VIOLET_LIGHT,
        fontFace: 'Calibri',
        align: 'center',
      })

      slide.addText(section.heading, {
        x: 8.4, y: 4.6, w: 4.4, h: 1.8,
        fontSize: 12,
        color: isDark ? GRAY : '6b7280',
        fontFace: 'Calibri',
        align: 'center',
        wrap: true,
      })

      slide.addNotes(section.content)
    }

    // ────────────────────────────────────────────────
    // SLIDE — Assessment
    // ────────────────────────────────────────────────
    const sAssess = pptx.addSlide()
    sAssess.background = { color: bg }

    sAssess.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 1.4,
      fill: { color: isDark ? '1a0a3e' : 'ede9fe' },
      line: { color: isDark ? '1a0a3e' : 'ede9fe' },
    })

    sAssess.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.5, h: 1.4,
      fill: { color: VIOLET },
      line: { color: VIOLET },
    })

    sAssess.addText('Assessment & Rubric', {
      x: 0.8, y: 0.2, w: 11.5, h: 1,
      fontSize: 28,
      bold: true,
      color: isDark ? VIOLET_LIGHT : VIOLET,
      fontFace: 'Calibri',
      valign: 'middle',
    })

    const assessBullets = truncateToBullets(plan.assessment, 6)
    sAssess.addText(assessBullets.map(b => ({
      text: `▸  ${b}`,
      options: { fontSize: 15, color: textColor, fontFace: 'Calibri' as const, paraSpaceAfter: 12 },
    })), {
      x: 0.8, y: 1.7, w: 11.8, h: 5.5,
      valign: 'top',
      wrap: true,
    })

    sAssess.addNotes(plan.assessment)

    // ────────────────────────────────────────────────
    // SLIDE — Summary / Key Takeaways
    // ────────────────────────────────────────────────
    const sSummary = pptx.addSlide()
    sSummary.background = { color: bg }

    // Mirror title slide style
    sSummary.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: '100%',
      fill: { color: VIOLET },
      line: { color: VIOLET },
    })

    sSummary.addShape(pptx.ShapeType.rect, {
      x: 7.5, y: 0, w: 5.83, h: 7.5,
      fill: { color: isDark ? '1a0a3e' : 'ede9fe' },
      line: { color: isDark ? '1a0a3e' : 'ede9fe' },
    })

    sSummary.addShape(pptx.ShapeType.ellipse, {
      x: 9.0, y: 1.5, w: 3, h: 3,
      fill: { color: VIOLET, transparency: 65 },
      line: { color: VIOLET, transparency: 65 },
    })

    sSummary.addText('Key Takeaways', {
      x: 0.5, y: 0.8, w: 6.7, h: 1.0,
      fontSize: 32,
      bold: true,
      color: isDark ? VIOLET_LIGHT : VIOLET,
      fontFace: 'Calibri',
    })

    const takeaways = truncateToBullets(plan.objectives, 4)
    sSummary.addText(takeaways.map(t => ({
      text: `✓  ${t}`,
      options: { fontSize: 16, color: textColor, fontFace: 'Calibri' as const, paraSpaceAfter: 14 },
    })), {
      x: 0.5, y: 2.1, w: 6.7, h: 4.5,
      valign: 'top',
    })

    sSummary.addText('LessonDeck', {
      x: 8.0, y: 6.5, w: 5, h: 0.5,
      fontSize: 14,
      color: VIOLET_LIGHT,
      bold: true,
      fontFace: 'Calibri',
      align: 'center',
    })

    sSummary.addNotes(`Key takeaways from: ${plan.title}`)

    // ────────────────────────────────────────────────
    // Write to buffer and return
    // ────────────────────────────────────────────────
    const nodeBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    const buffer = new Uint8Array(nodeBuffer).buffer
    const filename = `LessonDeck-${safeName(plan.title)}.pptx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': nodeBuffer.length.toString(),
      },
    })
  } catch (err) {
    const error = err as Error
    console.error('PPTX export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
