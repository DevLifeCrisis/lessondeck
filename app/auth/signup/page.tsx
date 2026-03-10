'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function SignUpForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const referral = searchParams.get('ref') || ''

  if (referral && !form.referralCode) {
    setForm(prev => ({ ...prev, referralCode: referral }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json() as { error?: string }

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // Sign in automatically
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/auth/signin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left column - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <Image
          src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80"
          alt="Students in classroom learning"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/50" />
        <div className="absolute top-12 left-12 right-12 text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">LessonForge</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join 2,400+ teachers saving time every week</h2>
          <ul className="space-y-3">
            {[
              '15 AI-generated plans per month',
              'All 50 state standards covered',
              'Differentiation strategies included',
              'PDF export ready',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-indigo-100">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">LessonForge</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start generating lesson plans today</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 min-h-[48px]"
                placeholder="Ms. Johnson"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 min-h-[48px]"
                placeholder="teacher@school.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 min-h-[48px]"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1.5">
                Referral code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="referral"
                type="text"
                value={form.referralCode}
                onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 min-h-[48px] uppercase"
                placeholder="REF123ABC"
              />
              {form.referralCode && (
                <p className="text-xs text-green-600 mt-1">Your referrer will get 5 bonus plans!</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline">Terms of Service</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
            Generated content is licensed for classroom use only.
          </p>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-indigo-600 font-medium hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}
