'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { GRADES, SUBJECTS, US_STATES } from '@/lib/constants'
import type { UserProfile } from '@/lib/storage'

interface CreateClientProps {
  profile: UserProfile | null
  userId: string
  isAdmin: boolean
}

export default function CreateClient({ profile, isAdmin }: CreateClientProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    grade: '',
    subject: '',
    standardsState: '',
    topic: '',
    duration: '50 minutes',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isActive = isAdmin || profile?.subscriptionStatus === 'active'
  const plansLeft = Math.max(0, 15 - (profile?.plansUsedThisMonth || 0))
  const burstLeft = profile?.burstPlans || 0
  const canCreate = isAdmin || (isActive && (plansLeft > 0 || burstLeft > 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json() as { plan?: { id?: string }; error?: string }

      if (!res.ok) {
        setError(data.error || 'Generation failed. Please try again.')
        return
      }

      if (data.plan?.id) {
        router.push(`/lesson/${data.plan.id}`)
      } else {
        router.push('/library')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const SelectField = ({
    id, label, value, options, onChange, placeholder
  }: {
    id: string
    label: string
    value: string
    options: string[]
    onChange: (v: string) => void
    placeholder: string
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white min-h-[48px]"
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Form */}
        <div>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Lesson Plan</h1>
            <p className="text-gray-500">Fill in the details and our AI will generate a complete lesson plan in seconds.</p>
          </div>

          {!isActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Subscription required</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Activate your subscription to generate lesson plans.{' '}
                  <a href="mailto:support@lessonforge.app" className="underline">Contact us</a> to get started.
                </p>
              </div>
            </div>
          )}

          {isActive && !isAdmin && plansLeft === 0 && burstLeft === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Monthly limit reached</p>
                <p className="text-sm text-red-700 mt-0.5">
                  You&apos;ve used all 15 plans this month. Purchase a burst pack to continue.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <SelectField
              id="grade"
              label="Grade Level *"
              value={form.grade}
              options={GRADES}
              onChange={v => setForm(f => ({ ...f, grade: v }))}
              placeholder="Select grade level"
            />

            <SelectField
              id="subject"
              label="Subject *"
              value={form.subject}
              options={SUBJECTS}
              onChange={v => setForm(f => ({ ...f, subject: v }))}
              placeholder="Select subject"
            />

            <SelectField
              id="state"
              label="State Standards *"
              value={form.standardsState}
              options={US_STATES}
              onChange={v => setForm(f => ({ ...f, standardsState: v }))}
              placeholder="Select your state"
            />

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1.5">
                Lesson Topic *
              </label>
              <input
                id="topic"
                type="text"
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                required
                placeholder="e.g., Introduction to Fractions, Civil War Causes, Photosynthesis"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 min-h-[48px]"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
                Lesson Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white min-h-[48px]"
                >
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>50 minutes</option>
                  <option>60 minutes</option>
                  <option>90 minutes</option>
                  <option>Block period (90-120 min)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canCreate}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold px-6 py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your lesson plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Lesson Plan
                </>
              )}
            </button>

            {isActive && !isAdmin && (
              <p className="text-center text-sm text-gray-500">
                {plansLeft > 0
                  ? `${plansLeft} of 15 monthly plans remaining`
                  : `Using burst pack (${burstLeft} remaining)`}
              </p>
            )}
          </form>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80"
              alt="Teacher planning lesson at desk"
              width={800}
              height={500}
              className="w-full object-cover h-64 sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">AI-Generated in 30 seconds</span>
              </div>
              <p className="text-sm text-indigo-200">
                Each plan includes objectives, activities, materials, assessment rubric, and differentiation strategies.
              </p>
            </div>
          </div>

          {/* What you get */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included in Every Plan</h3>
            <div className="space-y-3">
              {[
                { emoji: '🎯', label: 'Learning Objectives', desc: 'Bloom\'s taxonomy-aligned goals' },
                { emoji: '📋', label: 'Activities & Timeline', desc: 'Step-by-step with timing' },
                { emoji: '🛠️', label: 'Materials List', desc: 'Everything you need to prep' },
                { emoji: '📊', label: 'Assessment Rubric', desc: 'Clear grading criteria' },
                { emoji: '♿', label: 'Differentiation', desc: 'ELL, IEP/504, gifted strategies' },
                { emoji: '📐', label: 'Standards Alignment', desc: 'Your state, your grade' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
