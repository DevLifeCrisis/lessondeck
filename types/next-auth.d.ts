import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    subscriptionStatus: string
    plansUsedThisMonth: number
    burstPlans: number
    referralCode: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      subscriptionStatus: string
      plansUsedThisMonth: number
      burstPlans: number
      referralCode: string
    }
  }
}
