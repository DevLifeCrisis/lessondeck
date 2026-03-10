'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, BookOpen, Filter } from 'lucide-react'
import LessonPlanCard from '@/components/LessonPlanCard'
import type { LessonPlan } from '@/lib/storage'

interface LibraryClientProps {
  plans: LessonPlan[]
}

export default function LibraryClient({ plans: initialPlans }: LibraryClientProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return

    try {
      const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlans(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [])

  const filtered = plans.filter(plan => {
    const matchesSearch = !search ||
      plan.title.toLowerCase().includes(search.toLowerCase()) ||
      plan.topic.toLowerCase().includes(search.toLowerCase()) ||
      plan.subject.toLowerCase().includes(search.toLowerCase())

    const matchesGrade = !filterGrade || plan.grade === filterGrade
    const matchesSubject = !filterSubject || plan.subject === filterSubject

    return matchesSearch && matchesGrade && matchesSubject
  })

  const grades = [...new Set(plans.map(p => p.grade))].sort()
  const subjects = [...new Set(plans.map(p => p.subject))].sort()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-500 mt-1">{plans.length} lesson plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </Link>
      </div>

      {/* Filters */}
      {plans.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lesson plans..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[44px]"
            />
          </div>
          {grades.length > 1 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white appearance-none min-h-[44px]"
              >
                <option value="">All Grades</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          {subjects.length > 1 && (
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white appearance-none min-h-[44px]"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative w-full max-w-md mx-auto mb-8 rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
              alt="Empty library"
              width={600}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          </div>
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your library is empty</h2>
          <p className="text-gray-500 mb-6">Start generating lesson plans and they&apos;ll appear here</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            Create Your First Plan
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No plans match your search</p>
          <button
            onClick={() => { setSearch(''); setFilterGrade(''); setFilterSubject('') }}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(plan => (
            <LessonPlanCard key={plan.id} plan={plan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
