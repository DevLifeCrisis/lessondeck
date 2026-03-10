import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLessonPlan } from '@/lib/storage'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import type { LessonPlan } from '@/lib/storage'

// Register a clean font (fallback to Helvetica which is built-in)
// @react-pdf/renderer bundles Helvetica by default

const VIOLET = '#7c3aed'
const VIOLET_LIGHT = '#a78bfa'
const BG_COVER = '#0f1117'
const WHITE = '#ffffff'
const DARK = '#1e1b4b'
const GRAY = '#64748b'
const LIGHT_GRAY = '#f1f5f9'
const BORDER = '#e2e8f0'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: DARK,
    paddingBottom: 50,
  },
  // ── Cover ──────────────────────────────────────────
  coverPage: {
    backgroundColor: BG_COVER,
    padding: 0,
    paddingBottom: 0,
  },
  coverAccentBar: {
    width: 8,
    backgroundColor: VIOLET,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  coverContent: {
    flex: 1,
    paddingLeft: 48,
    paddingRight: 40,
    paddingTop: 60,
    paddingBottom: 60,
    justifyContent: 'center',
  },
  coverBadge: {
    fontSize: 11,
    color: VIOLET_LIGHT,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 32,
    letterSpacing: 2,
  },
  coverTitle: {
    fontSize: 36,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 24,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 40,
  },
  coverDecorCircle: {
    position: 'absolute',
    right: 60,
    top: 80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: VIOLET,
    opacity: 0.25,
  },
  coverDecorCircle2: {
    position: 'absolute',
    right: 100,
    bottom: 120,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: VIOLET_LIGHT,
    opacity: 0.2,
  },
  // ── Interior pages ─────────────────────────────────
  contentPage: {
    backgroundColor: WHITE,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  pageHeader: {
    backgroundColor: VIOLET,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginBottom: 0,
  },
  pageHeaderText: {
    fontSize: 20,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
  },
  pageBody: {
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: VIOLET,
    marginBottom: 8,
    marginTop: 16,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 11,
    color: VIOLET,
    width: 16,
    fontFamily: 'Helvetica-Bold',
  },
  bulletText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.5,
    flex: 1,
  },
  // ── TOC ──────────────────────────────────────────
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  tocItemText: {
    fontSize: 12,
    color: DARK,
  },
  tocItemPage: {
    fontSize: 11,
    color: GRAY,
  },
  // ── Vocabulary table ─────────────────────────────
  vocabTable: {
    marginTop: 8,
  },
  vocabHeader: {
    flexDirection: 'row',
    backgroundColor: VIOLET,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  vocabHeaderCell: {
    fontSize: 11,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  vocabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  vocabRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  vocabCell: {
    fontSize: 10,
    color: '#334155',
    flex: 1,
    lineHeight: 1.4,
  },
  vocabTerm: {
    fontFamily: 'Helvetica-Bold',
  },
  // ── Footer ───────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: GRAY,
  },
  footerBrand: {
    fontSize: 9,
    color: VIOLET,
    fontFamily: 'Helvetica-Bold',
  },
})

function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.replace(/^[-•*\d.]+\s*/, '').trim())
    .filter(Boolean)
}

function Footer({ pageNum }: { pageNum: number }) {
  return React.createElement(View, { style: styles.footer }, [
    React.createElement(Text, { key: 'brand', style: styles.footerBrand }, 'LessonDeck'),
    React.createElement(Text, { key: 'page', style: styles.footerText }, `Page ${pageNum}`),
  ])
}

function BulletList({ items }: { items: string[] }) {
  return React.createElement(
    View,
    null,
    items.map((item, i) =>
      React.createElement(View, { key: i, style: styles.bulletRow }, [
        React.createElement(Text, { key: 'dot', style: styles.bulletDot }, '•'),
        React.createElement(Text, { key: 'text', style: styles.bulletText }, item),
      ])
    )
  )
}

function buildDocument(plan: LessonPlan) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const meta = [plan.subject, plan.grade, plan.duration].filter(Boolean).join(' · ')

  const sections = [
    { title: 'Materials & Resources', content: plan.materials },
    { title: 'Lesson Activities', content: plan.activities },
    { title: 'Differentiation Strategies', content: plan.differentiation },
  ]

  const tocItems = [
    'Learning Objectives',
    ...sections.map(s => s.title),
    'Assessment & Rubric',
  ]

  let pageNum = 1

  const pages = []

  // ── Cover ──────────────────────────────────────────
  pages.push(
    React.createElement(
      Page,
      { key: 'cover', size: 'A4', style: [styles.page, styles.coverPage] },
      [
        React.createElement(View, { key: 'bar', style: styles.coverAccentBar }),
        React.createElement(View, { key: 'circle1', style: styles.coverDecorCircle }),
        React.createElement(View, { key: 'circle2', style: styles.coverDecorCircle2 }),
        React.createElement(View, { key: 'content', style: styles.coverContent }, [
          React.createElement(Text, { key: 'badge', style: styles.coverBadge }, 'LESSONDECK'),
          React.createElement(Text, { key: 'title', style: styles.coverTitle }, plan.title),
          React.createElement(Text, { key: 'meta', style: styles.coverSubtitle }, meta),
          React.createElement(Text, { key: 'date', style: styles.coverDate }, dateStr),
        ]),
      ]
    )
  )

  pageNum++

  // ── Table of Contents ─────────────────────────────
  pages.push(
    React.createElement(
      Page,
      { key: 'toc', size: 'A4', style: [styles.page, styles.contentPage] },
      [
        React.createElement(View, { key: 'header', style: styles.pageHeader },
          React.createElement(Text, { style: styles.pageHeaderText }, 'Table of Contents')
        ),
        React.createElement(View, { key: 'body', style: styles.pageBody },
          tocItems.map((item, i) =>
            React.createElement(View, { key: i, style: styles.tocItem }, [
              React.createElement(Text, { key: 'text', style: styles.tocItemText }, item),
              React.createElement(Text, { key: 'pg', style: styles.tocItemPage }, `${i + 3}`),
            ])
          )
        ),
        React.createElement(Footer, { key: 'footer', pageNum }),
      ]
    )
  )

  pageNum++

  // ── Objectives ────────────────────────────────────
  const objBullets = parseBullets(plan.objectives)
  pages.push(
    React.createElement(
      Page,
      { key: 'objectives', size: 'A4', style: [styles.page, styles.contentPage] },
      [
        React.createElement(View, { key: 'header', style: styles.pageHeader },
          React.createElement(Text, { style: styles.pageHeaderText }, 'Learning Objectives')
        ),
        React.createElement(View, { key: 'body', style: styles.pageBody },
          React.createElement(BulletList, { items: objBullets })
        ),
        React.createElement(Footer, { key: 'footer', pageNum }),
      ]
    )
  )

  pageNum++

  // ── Content Sections ──────────────────────────────
  for (const section of sections) {
    const bullets = parseBullets(section.content)
    pages.push(
      React.createElement(
        Page,
        { key: `section-${section.title}`, size: 'A4', style: [styles.page, styles.contentPage] },
        [
          React.createElement(View, { key: 'header', style: styles.pageHeader },
            React.createElement(Text, { style: styles.pageHeaderText }, section.title)
          ),
          React.createElement(View, { key: 'body', style: styles.pageBody }, [
            React.createElement(View, { key: 'sep', style: styles.separator }),
            React.createElement(BulletList, { key: 'bullets', items: bullets }),
          ]),
          React.createElement(Footer, { key: 'footer', pageNum }),
        ]
      )
    )
    pageNum++
  }

  // ── Assessment ────────────────────────────────────
  const assessBullets = parseBullets(plan.assessment)
  pages.push(
    React.createElement(
      Page,
      { key: 'assessment', size: 'A4', style: [styles.page, styles.contentPage] },
      [
        React.createElement(View, { key: 'header', style: styles.pageHeader },
          React.createElement(Text, { style: styles.pageHeaderText }, 'Assessment & Rubric')
        ),
        React.createElement(View, { key: 'body', style: styles.pageBody }, [
          React.createElement(View, { key: 'sep', style: styles.separator }),
          React.createElement(BulletList, { key: 'bullets', items: assessBullets }),
        ]),
        React.createElement(Footer, { key: 'footer', pageNum }),
      ]
    )
  )

  return React.createElement(Document, null, ...pages)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { lessonPlan?: LessonPlan; planId?: string; htmlContent?: string }

    let plan: LessonPlan | null = null

    if (body.lessonPlan) {
      plan = body.lessonPlan
    } else if (body.planId) {
      plan = await getLessonPlan(session.user.id, body.planId)
    }

    if (!plan) {
      // Legacy path: return sanitized HTML for client-side PDF
      if (body.htmlContent) {
        return NextResponse.json({ htmlContent: body.htmlContent, success: true })
      }
      return NextResponse.json({ error: 'lessonPlan or planId required' }, { status: 400 })
    }

    const doc = buildDocument(plan)
    const nodeBuffer = await renderToBuffer(doc)
    const buffer = new Uint8Array(nodeBuffer).buffer

    const filename = `LessonDeck-${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': nodeBuffer.length.toString(),
      },
    })
  } catch (err) {
    const error = err as Error
    console.error('PDF export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
