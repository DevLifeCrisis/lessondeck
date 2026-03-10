import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/storage'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const profile = await getUserProfile(session.user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  return <AdminClient />
}
