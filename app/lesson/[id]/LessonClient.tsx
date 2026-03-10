'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, Save, Loader2, CheckCircle,
  Bold, Italic, List, Heading2, Undo, Redo,
  BookOpen, Tag, Clock, Globe, FileText, Presentation, FileCheck,
  ChevronDown
} from 'lucide-react'
import type { LessonPlan } from '@/lib/storage'

interface LessonClientProps {
  plan: LessonPlan
}

type ExportFormat = 'pdf' | 'pptx' | 'docx'

async function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export default function LessonClient({ plan }: LessonClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [title, setTitle] = useState(plan.title)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start editing your lesson plan...',
      }),
    ],
    content: plan.htmlContent || buildHtmlFromPlan(plan),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[400px] p-4 sm:p-6',
      },
    },
  })

  const handleSave = useCallback(async () => {
    if (!editor) return
    setSaving(true)
    try {
      const htmlContent = editor.getHTML()
      await fetch(`/api/lessons/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, htmlContent }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [editor, plan.id, title])

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExportingFormat(format)
    setShowExportMenu(false)
    try {
      const planData: LessonPlan = { ...plan, title }

      let endpoint = `/api/export/${format}`
      const body: Record<string, unknown> = { lessonPlan: planData }
      if (format === 'pptx') body.theme = 'dark'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }))
        throw new Error(err.error || 'Export failed')
      }

      const blob = await res.blob()
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const ext = format
      await triggerDownload(blob, `LessonDeck-${safeTitle}.${ext}`)
    } catch (err) {
      console.error(`${format.toUpperCase()} export failed:`, err)
      alert(`Export failed: ${(err as Error).message}`)
    } finally {
      setExportingFormat(null)
    }
  }, [plan, title])

  const isExporting = exportingFormat !== null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back nav */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/library"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>

      {/* Title */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-2xl sm:text-3xl font-bold text-gray-900 border-none outline-none bg-transparent focus:ring-2 focus:ring-indigo-200 rounded-lg px-2 py-1"
          placeholder="Lesson title..."
        />

        <div className="flex flex-wrap gap-3 mt-3 px-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Tag className="w-3.5 h-3.5" />
            {plan.grade}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <BookOpen className="w-3.5 h-3.5" />
            {plan.subject}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Globe className="w-3.5 h-3.5" />
            {plan.standardsState}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {plan.duration}
          </div>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="bg-white border border-gray-200 rounded-t-xl px-3 py-2 flex flex-wrap items-center gap-1">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${editor?.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${editor?.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${editor?.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${editor?.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-40"
          disabled={!editor?.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().redo().run()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-40"
          disabled={!editor?.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(v => !v)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[36px] disabled:opacity-60"
            >
              {isExporting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => handleExport('pptx')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Presentation className="w-4 h-4 text-violet-600" />
                  <span>Download Slides <span className="text-gray-400 text-xs">.pptx</span></span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Download Guide <span className="text-gray-400 text-xs">.pdf</span></span>
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-blue-500" />
                  <span>Download Doc <span className="text-gray-400 text-xs">.docx</span></span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors min-h-[36px] disabled:opacity-60 ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl min-h-[500px]">
        <EditorContent editor={editor} className="focus-within:ring-2 focus-within:ring-indigo-200 rounded-b-xl" />
      </div>

      {/* Export Bar — mobile-friendly */}
      <div className="mt-6 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-900">Export Lesson</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* PPTX */}
          <button
            onClick={() => handleExport('pptx')}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-60 min-h-[48px]"
          >
            {exportingFormat === 'pptx'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Presentation className="w-4 h-4" />
            }
            <span>📊 Download Slides</span>
            <span className="text-violet-300 text-xs">.pptx</span>
          </button>

          {/* PDF */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-medium disabled:opacity-60 min-h-[48px]"
          >
            {exportingFormat === 'pdf'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileText className="w-4 h-4" />
            }
            <span>📄 Download Guide</span>
            <span className="text-rose-300 text-xs">.pdf</span>
          </button>

          {/* DOCX */}
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 min-h-[48px]"
          >
            {exportingFormat === 'docx'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileCheck className="w-4 h-4" />
            }
            <span>📝 Download Doc</span>
            <span className="text-blue-300 text-xs">.docx</span>
          </button>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p className="text-sm text-gray-500">
          Created {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium min-h-[44px] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  )
}

function buildHtmlFromPlan(plan: LessonPlan): string {
  return `
<h2>Learning Objectives</h2>
${plan.objectives.split('\n').filter(Boolean).map(line => `<p>${line}</p>`).join('')}

<h2>Materials Needed</h2>
${plan.materials.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('')}

<h2>Lesson Activities</h2>
${plan.activities.split('\n\n').filter(Boolean).map(section => `<p>${section}</p>`).join('')}

<h2>Assessment &amp; Rubric</h2>
${plan.assessment.split('\n\n').filter(Boolean).map(section => `<p>${section}</p>`).join('')}

<h2>Differentiation Strategies</h2>
${plan.differentiation.split('\n\n').filter(Boolean).map(section => `<p>${section}</p>`).join('')}
`.trim()
}
