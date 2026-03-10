import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/storage'
import CreateClient from './CreateClient'

export default async function CreatePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const profile = await getUserProfile(session.user.id)

  return <CreateClient profile={profile} userId={session.user.id} isAdmin={session.user.role === 'admin'} />
}
