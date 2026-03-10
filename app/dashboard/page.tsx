import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserProfile, listLessonPlans } from '@/lib/storage'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const [profile, recentPlans] = await Promise.all([
    getUserProfile(session.user.id),
    listLessonPlans(session.user.id),
  ])

  return (
    <DashboardClient
      user={session.user}
      profile={profile}
      recentPlans={recentPlans.slice(0, 6)}
      totalPlans={recentPlans.length}
    />
  )
}
