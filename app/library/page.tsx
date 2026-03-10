import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { listLessonPlans } from '@/lib/storage'
import LibraryClient from './LibraryClient'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const plans = await listLessonPlans(session.user.id)

  return <LibraryClient plans={plans} />
}
