import { supabaseAdmin } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface LessonPlan {
  id: string
  userId: string
  title: string
  grade: string
  subject: string
  standardsState: string
  topic: string
  objectives: string
  materials: string
  activities: string
  assessment: string
  differentiation: string
  duration: string
  htmlContent: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  name: string
  role: 'teacher' | 'admin'
  subscriptionStatus: 'active' | 'inactive' | 'trial'
  plansUsedThisMonth: number
  burstPlans: number
  referralCode: string
  referredBy?: string
  monthResetDate: string
}

const BUCKET = 'lesson-plans'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (error || !user) return null

  const meta = user.user_metadata as Record<string, unknown>

  // Check if we need to reset monthly count
  const now = new Date()
  const resetDate = meta.monthResetDate ? new Date(meta.monthResetDate as string) : null
  let plansUsed = (meta.plansUsedThisMonth as number) || 0

  if (!resetDate || now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    // New month - reset count
    plansUsed = 0
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        plansUsedThisMonth: 0,
        monthResetDate: now.toISOString(),
      }
    })
  }

  return {
    name: (meta.name as string) || user.email?.split('@')[0] || 'Teacher',
    role: (meta.role as 'teacher' | 'admin') || 'teacher',
    subscriptionStatus: (meta.subscriptionStatus as 'active' | 'inactive' | 'trial') || 'inactive',
    plansUsedThisMonth: plansUsed,
    burstPlans: (meta.burstPlans as number) || 0,
    referralCode: (meta.referralCode as string) || generateReferralCode(userId),
    referredBy: meta.referredBy as string | undefined,
    monthResetDate: (meta.monthResetDate as string) || now.toISOString(),
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
  const meta = user?.user_metadata || {}
  
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { ...meta, ...updates }
  })
}

export async function saveLessonPlan(plan: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<LessonPlan> {
  const id = uuidv4()
  const now = new Date().toISOString()
  const fullPlan: LessonPlan = {
    ...plan,
    id,
    createdAt: now,
    updatedAt: now,
  }

  const path = `${plan.userId}/${id}.json`
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, JSON.stringify(fullPlan), {
      contentType: 'application/json',
      upsert: true,
    })

  if (error) throw new Error(`Failed to save lesson plan: ${error.message}`)

  return fullPlan
}

export async function updateLessonPlan(userId: string, planId: string, updates: Partial<LessonPlan>): Promise<LessonPlan> {
  const existing = await getLessonPlan(userId, planId)
  if (!existing) throw new Error('Lesson plan not found')

  const updated: LessonPlan = {
    ...existing,
    ...updates,
    id: planId,
    userId,
    updatedAt: new Date().toISOString(),
  }

  const path = `${userId}/${planId}.json`
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, JSON.stringify(updated), {
      contentType: 'application/json',
      upsert: true,
    })

  if (error) throw new Error(`Failed to update lesson plan: ${error.message}`)

  return updated
}

export async function getLessonPlan(userId: string, planId: string): Promise<LessonPlan | null> {
  const path = `${userId}/${planId}.json`
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(path)

  if (error || !data) return null

  const text = await data.text()
  return JSON.parse(text) as LessonPlan
}

export async function listLessonPlans(userId: string): Promise<LessonPlan[]> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(userId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error || !data) return []

  const plans: LessonPlan[] = []
  for (const file of data) {
    if (file.name.endsWith('.json')) {
      const planId = file.name.replace('.json', '')
      const plan = await getLessonPlan(userId, planId)
      if (plan) plans.push(plan)
    }
  }

  return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteLessonPlan(userId: string, planId: string): Promise<void> {
  const path = `${userId}/${planId}.json`
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([path])

  if (error) throw new Error(`Failed to delete lesson plan: ${error.message}`)
}

function generateReferralCode(userId: string): string {
  return 'REF' + userId.substring(0, 6).toUpperCase()
}

export async function incrementPlansUsed(userId: string): Promise<void> {
  const profile = await getUserProfile(userId)
  if (!profile) return

  await updateUserProfile(userId, {
    plansUsedThisMonth: profile.plansUsedThisMonth + 1,
  })
}

export async function canCreatePlan(userId: string): Promise<{ allowed: boolean; reason?: string; plansLeft: number; burstLeft: number }> {
  const profile = await getUserProfile(userId)
  if (!profile) return { allowed: false, reason: 'Profile not found', plansLeft: 0, burstLeft: 0 }

  if (profile.subscriptionStatus !== 'active') {
    return { allowed: false, reason: 'No active subscription', plansLeft: 0, burstLeft: 0 }
  }

  const MONTHLY_LIMIT = 15
  const plansLeft = Math.max(0, MONTHLY_LIMIT - profile.plansUsedThisMonth)
  const burstLeft = profile.burstPlans

  if (plansLeft > 0) {
    return { allowed: true, plansLeft, burstLeft }
  }

  if (burstLeft > 0) {
    return { allowed: true, plansLeft: 0, burstLeft }
  }

  return {
    allowed: false,
    reason: 'Monthly plan limit reached. Purchase a burst pack to continue.',
    plansLeft: 0,
    burstLeft: 0,
  }
}
