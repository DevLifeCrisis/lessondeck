'use client'

import { Zap, Plus } from 'lucide-react'

interface UsageMeterProps {
  plansUsed: number
  monthlyLimit: number
  burstPlans: number
}

export default function UsageMeter({ plansUsed, monthlyLimit, burstPlans }: UsageMeterProps) {
  const percentage = Math.min(100, (plansUsed / monthlyLimit) * 100)
  const remaining = Math.max(0, monthlyLimit - plansUsed)
  const isWarning = percentage >= 80
  const isExhausted = plansUsed >= monthlyLimit

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Monthly Plans</h3>
        <span className={`text-sm font-medium ${isExhausted ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'}`}>
          {remaining} left
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{plansUsed} used</span>
          <span>{monthlyLimit} / month</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isExhausted ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {burstPlans > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span>{burstPlans} burst plan{burstPlans !== 1 ? 's' : ''} available</span>
        </div>
      )}

      {isExhausted && burstPlans === 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-2">Monthly limit reached. Get more plans:</p>
          <a
            href="/settings#burst"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Buy Burst Pack ($5 for 5 plans)
          </a>
        </div>
      )}
    </div>
  )
}
