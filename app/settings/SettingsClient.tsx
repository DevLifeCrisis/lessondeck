'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  User, CreditCard, Gift, Zap, CheckCircle, Copy,
  ExternalLink, AlertCircle
} from 'lucide-react'
import type { UserProfile } from '@/lib/storage'
import type { Session } from 'next-auth'

interface SettingsClientProps {
  user: Session['user']
  profile: UserProfile | null
}

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const [copied, setCopied] = useState(false)

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/auth/signup?ref=${profile.referralCode}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isActive = profile?.subscriptionStatus === 'active'
  const isTrial = profile?.subscriptionStatus === 'trial'
  const plansUsed = profile?.plansUsedThisMonth || 0
  const plansLeft = Math.max(0, 15 - plansUsed)
  const burstPlans = profile?.burstPlans || 0

  const statusColor = isActive ? 'green' : isTrial ? 'amber' : 'gray'
  const statusLabel = isActive ? 'Active' : isTrial ? 'Trial' : 'Inactive'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Account</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
            <p className="text-gray-900 font-medium mt-0.5">{profile?.name || user.name || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
            <p className="text-gray-900 font-medium mt-0.5">{user.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Role</label>
            <p className="text-gray-900 font-medium capitalize mt-0.5">{profile?.role || 'teacher'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Member Since</label>
            <p className="text-gray-900 font-medium mt-0.5">March 2026</p>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Subscription</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">Individual Teacher</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${statusColor}-100 text-${statusColor}-700`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">$49/year · 15 plans/month</p>
          </div>
          {!isActive && (
            <a
              href="mailto:support@lessonforge.app?subject=Activate LessonForge Subscription"
              className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm min-h-[44px]"
            >
              Activate Subscription
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {isActive && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1.5">
              <span>{plansUsed} of 15 plans used this month</span>
              <span>{plansLeft} remaining</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${plansLeft === 0 ? 'bg-red-500' : plansLeft <= 3 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (plansUsed / 15) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Resets on the 1st of each month · Plans don&apos;t roll over</p>
          </div>
        )}
      </section>

      {/* Burst Packs */}
      <section id="burst" className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Burst Packs</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-700">
              You have <span className="font-bold text-gray-900">{burstPlans} burst plan{burstPlans !== 1 ? 's' : ''}</span> available
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Burst plans roll over month to month · $5 for 5 plans
            </p>
          </div>
          <a
            href="mailto:support@lessonforge.app?subject=Purchase Burst Pack"
            className="flex items-center gap-2 bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm min-h-[44px] whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            Buy Burst Pack — $5
          </a>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Burst packs are great for unit planning season when you need extra plans. They never expire.</p>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Gift className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Referral Program</h2>
        </div>

        <div className="relative rounded-xl overflow-hidden mb-5">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
            alt="Teachers collaborating and sharing"
            width={600}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-900/40 flex items-center px-6">
            <div className="text-white">
              <p className="font-bold text-lg">Earn 5 plans per referral</p>
              <p className="text-green-200 text-sm">Share your code with fellow teachers</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          For every teacher who signs up with your referral code, you both get 5 bonus plans added to your burst pack. 
          Unlimited referrals. Plans roll over indefinitely.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Your referral link</p>
            <p className="font-mono text-sm text-indigo-600 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${profile?.referralCode}` : `/auth/signup?ref=${profile?.referralCode}`}
            </p>
          </div>
          <button
            onClick={copyReferralCode}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm min-h-[48px]"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </section>

      {/* IP Terms Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">Content Usage Policy</p>
        <p>
          Lesson plans generated by LessonForge are licensed for your personal classroom use only. 
          Redistribution, resale, or publishing on third-party marketplaces (including Teachers Pay Teachers) is prohibited. 
          See our <a href="#" className="underline hover:text-gray-800">Terms of Service</a> for details.
        </p>
      </div>
    </div>
  )
}
