'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, BookOpen, TrendingUp, Clock, Sparkles, Library, Gift } from 'lucide-react'
import UsageMeter from '@/components/UsageMeter'
import LessonPlanCard from '@/components/LessonPlanCard'
import type { LessonPlan, UserProfile } from '@/lib/storage'
import type { Session } from 'next-auth'

interface DashboardClientProps {
  user: Session['user']
  profile: UserProfile | null
  recentPlans: LessonPlan[]
  totalPlans: number
}

export default function DashboardClient({ user, profile, recentPlans, totalPlans }: DashboardClientProps) {
  const isActive = profile?.subscriptionStatus === 'active'
  const firstName = (user.name || user.email || 'Teacher').split(' ')[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Good morning, {firstName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {isActive
                ? `You have ${Math.max(0, 15 - (profile?.plansUsedThisMonth || 0))} plans left this month`
                : 'Activate your subscription to start generating lesson plans'}
            </p>
          </div>
          {isActive && (
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors min-h-[48px]"
            >
              <Plus className="w-5 h-5" />
              New Lesson Plan
            </Link>
          )}
        </div>
      </div>

      {/* Subscription Banner */}
      {!isActive && (
        <div className="mb-8 relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
              alt="Teachers collaborating"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-indigo-900/80" />
          </div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold text-lg">Activate Your Subscription</h3>
                <p className="text-indigo-200 text-sm mt-1">Get 15 AI-generated lesson plans per month for $49/year</p>
              </div>
              <a
                href="mailto:support@lessonforge.app?subject=Activate Subscription"
                className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-sm whitespace-nowrap min-h-[48px] flex items-center"
              >
                Activate Now — $49/yr
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Total Plans', value: totalPlans, color: 'indigo' },
          { icon: TrendingUp, label: 'Used This Month', value: profile?.plansUsedThisMonth || 0, color: 'green' },
          { icon: Clock, label: 'Plans Remaining', value: Math.max(0, 15 - (profile?.plansUsedThisMonth || 0)), color: 'amber' },
          { icon: Sparkles, label: 'Burst Plans', value: profile?.burstPlans || 0, color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Plans */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Recent Lesson Plans</h2>
            <Link href="/library" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all
              <Library className="w-4 h-4" />
            </Link>
          </div>

          {recentPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No lesson plans yet</h3>
              <p className="text-gray-500 text-sm mb-6">Generate your first AI-powered lesson plan in seconds</p>
              {isActive ? (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors min-h-[48px]"
                >
                  <Plus className="w-4 h-4" />
                  Create First Plan
                </Link>
              ) : (
                <p className="text-sm text-gray-400">Activate your subscription to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentPlans.map(plan => (
                <LessonPlanCard key={plan.id} plan={plan} />
              ))}
              {totalPlans > 6 && (
                <Link
                  href="/library"
                  className="block text-center py-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View {totalPlans - 6} more plans →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Meter */}
          {isActive && (
            <UsageMeter
              plansUsed={profile?.plansUsedThisMonth || 0}
              monthlyLimit={15}
              burstPlans={profile?.burstPlans || 0}
            />
          )}

          {/* Referral Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Refer & Earn</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Share your referral code and earn 5 bonus plans for every teacher who signs up.
            </p>
            {profile?.referralCode && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="font-mono font-bold text-indigo-600 text-lg tracking-wider">
                  {profile.referralCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(profile.referralCode)}
                  className="text-xs text-gray-500 hover:text-indigo-600 transition-colors min-h-[36px] px-2"
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Quick Create */}
          {isActive && (
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80"
                alt="Books and education"
                width={400}
                height={200}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-indigo-900/70 flex items-center justify-center">
                <Link
                  href="/create"
                  className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  Generate New Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
