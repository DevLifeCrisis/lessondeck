import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  UnderlineType,
} from 'docx'
import type { LessonPlan } from '@/lib/storage'

function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.replace(/^[-•*\d.]+\s*/, '').trim())
    .filter(Boolean)
}

function safeName(title: string): string {
  return title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
}

function heading1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
  })
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: '7c3aed',
        font: 'Calibri',
      }),
    ],
    spacing: { before: 320, after: 80 },
    border: {
      bottom: {
        color: '7c3aed',
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  })
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24,
        font: 'Calibri',
        color: '334155',
      }),
    ],
    spacing: { after: 80, line: 276 },
  })
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24,
        font: 'Calibri',
        color: '334155',
      }),
    ],
    bullet: { level: 0 },
    spacing: { after: 60 },
  })
}

function metaParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 24, font: 'Calibri', color: '1e1b4b' }),
      new TextRun({ text: value, size: 24, font: 'Calibri', color: '64748b' }),
    ],
    spacing: { after: 40 },
  })
}

function spacer(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 120 } })
}

function vocabTable(text: string): Table {
  const lines = parseBullets(text)

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: 'Term', bold: true, color: 'ffffff', font: 'Calibri', size: 22 })],
        })],
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: '7c3aed', fill: '7c3aed' },
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: 'Definition', bold: true, color: 'ffffff', font: 'Calibri', size: 22 })],
        })],
        width: { size: 70, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: '7c3aed', fill: '7c3aed' },
      }),
    ],
  })

  const dataRows = lines.map((line, i) => {
    // Try to split on first colon or dash
    const sepIdx = line.search(/[:\-—]/)
    let term = line
    let def = ''
    if (sepIdx > 0) {
      term = line.substring(0, sepIdx).trim()
      def = line.substring(sepIdx + 1).trim()
    }

    const isAlt = i % 2 === 1
    const fillColor = isAlt ? 'f1f5f9' : 'ffffff'

    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: term, bold: true, font: 'Calibri', size: 22, color: '1e1b4b' })],
          })],
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: fillColor, fill: fillColor },
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: def || '—', font: 'Calibri', size: 22, color: '334155' })],
          })],
          width: { size: 70, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: fillColor, fill: fillColor },
        }),
      ],
    })
  })

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

function buildDocument(plan: LessonPlan): Document {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const objBullets = parseBullets(plan.objectives)
  const matBullets = parseBullets(plan.materials)
  const actBullets = parseBullets(plan.activities)
  const diffBullets = parseBullets(plan.differentiation)
  const assessBullets = parseBullets(plan.assessment)

  const sections = [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: plan.title,
              bold: true,
              size: 56,
              font: 'Calibri',
              color: '1e1b4b',
            }),
          ],
          spacing: { after: 160 },
        }),

        // Meta info
        metaParagraph('Subject', plan.subject),
        metaParagraph('Grade', plan.grade),
        metaParagraph('Duration', plan.duration),
        metaParagraph('Standards', plan.standardsState),
        metaParagraph('Date', dateStr),

        spacer(),

        // Divider paragraph
        new Paragraph({
          border: {
            bottom: { color: '7c3aed', space: 1, style: BorderStyle.SINGLE, size: 12 },
          },
          spacing: { after: 240 },
          text: '',
        }),

        // Learning Objectives
        heading2('Learning Objectives'),
        ...objBullets.map(b => bulletParagraph(b)),

        spacer(),

        // Materials
        heading2('Materials & Resources'),
        ...matBullets.map(b => bulletParagraph(b)),

        spacer(),

        // Activities
        heading2('Lesson Activities'),
        ...actBullets.map(b => bulletParagraph(b)),

        spacer(),

        // Differentiation
        heading2('Differentiation Strategies'),
        ...diffBullets.map(b => bulletParagraph(b)),

        spacer(),

        // Assessment
        heading2('Assessment & Rubric'),
        ...assessBullets.map(b => bulletParagraph(b)),

        spacer(),

        // Vocabulary (if available — parsed from objectives/activities for now)
        heading2('Key Vocabulary'),
        // Build a simple table from any term: definition lines found in objectives
        ...(plan.objectives.includes(':')
          ? [vocabTable(plan.objectives)]
          : [bodyParagraph('Refer to lesson materials for vocabulary terms.')]),
      ],
    },
  ]

  return new Document({
    creator: 'LessonDeck',
    title: plan.title,
    description: `Lesson plan for ${plan.subject} - ${plan.grade}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 24,
          },
        },
      },
    },
    sections,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { lessonPlan: LessonPlan }
    const { lessonPlan: plan } = body

    if (!plan) {
      return NextResponse.json({ error: 'lessonPlan required' }, { status: 400 })
    }

    const doc = buildDocument(plan)
    const nodeBuffer = await Packer.toBuffer(doc)
    const buffer = new Uint8Array(nodeBuffer).buffer

    const filename = `LessonDeck-${safeName(plan.title)}.docx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': nodeBuffer.length.toString(),
      },
    })
  } catch (err) {
    const error = err as Error
    console.error('DOCX export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
