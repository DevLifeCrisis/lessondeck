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
  BookOpen, Tag, Clock, Globe
} from 'lucide-react'
import type { LessonPlan } from '@/lib/storage'

interface LessonClientProps {
  plan: LessonPlan
}

export default function LessonClient({ plan }: LessonClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
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

  const handleExportPdf = useCallback(async () => {
    if (!editor) return
    setExporting(true)
    try {
      const htmlContent = editor.getHTML()

      // Dynamic import for client-side only
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      // Create a temporary div with the content
      const printDiv = document.createElement('div')
      printDiv.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.6;
      `
      printDiv.innerHTML = `
        <h1 style="font-size: 20px; margin-bottom: 8px; color: #1e293b;">${title}</h1>
        <div style="color: #64748b; font-size: 11px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
          ${plan.grade} · ${plan.subject} · ${plan.standardsState} · ${plan.duration}
        </div>
        ${htmlContent}
      `
      document.body.appendChild(printDiv)

      const canvas = await html2canvas(printDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      document.body.removeChild(printDiv)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }, [editor, plan, title])

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

      {/* Toolbar */}
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
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[36px] disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Export PDF</span>
          </button>
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

      {/* Bottom actions */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <p className="text-sm text-gray-500">
          Created {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm min-h-[44px] disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export to PDF
          </button>
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
