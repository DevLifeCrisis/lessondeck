'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Users, Shield, CheckCircle, XCircle, Loader2, TrendingUp, BookOpen } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  subscriptionStatus: string
  plansUsedThisMonth: number
  burstPlans: number
  createdAt: string
}

export default function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json() as { users: AdminUser[] }
      setUsers(data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleSubscription = async (userId: string, currentStatus: string) => {
    setUpdating(userId)
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: newStatus } : u))
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setUpdating(null)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscriptionStatus === 'active').length,
    totalPlansUsed: users.reduce((sum, u) => sum + u.plansUsedThisMonth, 0),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <Image
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
          alt="Admin dashboard background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/80" />
        <div className="relative p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-indigo-200">Manage users, subscriptions, and platform health</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Users', value: stats.total, color: 'indigo' },
          { icon: CheckCircle, label: 'Active Subscriptions', value: stats.active, color: 'green' },
          { icon: BookOpen, label: 'Plans Used (Month)', value: stats.totalPlansUsed, color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue estimate */}
      {stats.active > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <span className="font-semibold text-indigo-900">Estimated ARR: </span>
            <span className="text-indigo-700">${(stats.active * 49).toLocaleString()}/year</span>
            <span className="text-indigo-500 text-sm ml-2">based on {stats.active} active subscriptions at $49/yr</span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Users</h2>
          <span className="text-sm text-gray-500">{users.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium hidden sm:table-cell">Role</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Plans Used</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {user.subscriptionStatus === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${user.subscriptionStatus === 'active' ? 'text-green-700' : 'text-gray-500'}`}>
                          {user.subscriptionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-gray-600">
                      {user.plansUsedThisMonth} / 15
                    </td>
                    <td className="px-5 py-3 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleSubscription(user.id, user.subscriptionStatus)}
                          disabled={updating === user.id}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                            user.subscriptionStatus === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } disabled:opacity-60`}
                        >
                          {updating === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : user.subscriptionStatus === 'active' ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
