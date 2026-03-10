import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data.user) return null

        const meta = data.user.user_metadata as Record<string, unknown>

        return {
          id: data.user.id,
          email: data.user.email!,
          name: (meta.name as string) || data.user.email!.split('@')[0],
          role: (meta.role as string) || 'teacher',
          subscriptionStatus: (meta.subscriptionStatus as string) || 'inactive',
          plansUsedThisMonth: (meta.plansUsedThisMonth as number) || 0,
          burstPlans: (meta.burstPlans as number) || 0,
          referralCode: (meta.referralCode as string) || '',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.subscriptionStatus = (user as { subscriptionStatus?: string }).subscriptionStatus
        token.plansUsedThisMonth = (user as { plansUsedThisMonth?: number }).plansUsedThisMonth
        token.burstPlans = (user as { burstPlans?: number }).burstPlans
        token.referralCode = (user as { referralCode?: string }).referralCode
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.plansUsedThisMonth = token.plansUsedThisMonth as number
        session.user.burstPlans = token.burstPlans as number
        session.user.referralCode = token.referralCode as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
