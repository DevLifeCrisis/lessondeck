'use client'

import Link from 'next/link'
import { BookOpen, Calendar, Tag, ChevronRight, Trash2 } from 'lucide-react'
import type { LessonPlan } from '@/lib/storage'

interface LessonPlanCardProps {
  plan: LessonPlan
  onDelete?: (id: string) => void
}

export default function LessonPlanCard({ plan, onDelete }: LessonPlanCardProps) {
  const date = new Date(plan.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group">
      <Link href={`/lesson/${plan.id}`} className="block p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {plan.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                <Tag className="w-3 h-3" />
                {plan.grade}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                {plan.subject}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                {plan.standardsState}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 mt-1" />
        </div>
      </Link>
      {onDelete && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-2 flex justify-end">
          <button
            onClick={() => onDelete(plan.id)}
            className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 min-h-[36px] px-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
