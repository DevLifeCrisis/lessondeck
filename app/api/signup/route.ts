import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { rateLimit, getRequestIdentifier } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 signup attempts per 15 minutes per IP
    const identifier = getRequestIdentifier(req, 'signup')
    const rl = rateLimit(identifier, { limit: 5, windowMs: 15 * 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { email, password, name, referralCode } = await req.json() as {
      email: string
      password: string
      name: string
      referralCode?: string
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if referral code is valid
    let referrerId: string | undefined
    if (referralCode) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const referrer = users?.users?.find(u => 
        u.user_metadata?.referralCode === referralCode
      )
      if (referrer) {
        referrerId = referrer.id
      }
    }

    const myReferralCode = 'REF' + uuidv4().substring(0, 6).toUpperCase()
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'teacher',
        subscriptionStatus: 'inactive',
        plansUsedThisMonth: 0,
        burstPlans: 0,
        referralCode: myReferralCode,
        referredBy: referrerId,
        monthResetDate: now,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If referred, give referrer bonus plans
    if (referrerId) {
      const { data: { user: referrer } } = await supabaseAdmin.auth.admin.getUserById(referrerId)
      if (referrer) {
        const meta = referrer.user_metadata as Record<string, unknown>
        await supabaseAdmin.auth.admin.updateUserById(referrerId, {
          user_metadata: {
            ...meta,
            burstPlans: ((meta.burstPlans as number) || 0) + 5,
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      userId: data.user.id,
      message: 'Account created successfully'
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
