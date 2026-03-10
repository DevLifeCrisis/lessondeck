import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getLessonPlan } from '@/lib/storage'
import LessonClient from './LessonClient'

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const { id } = await params
  const plan = await getLessonPlan(session.user.id, id)
  if (!plan) notFound()

  return <LessonClient plan={plan} />
}
