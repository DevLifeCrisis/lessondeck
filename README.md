# LessonDeck 📚

AI-powered lesson plan generator for K-12 teachers. Generate standards-aligned, differentiated lesson plans in 30 seconds.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** (Auth + Storage for lesson plans)
- **NextAuth v4** (Session management)
- **TipTap** (Rich text editor)
- **jsPDF + html2canvas** (PDF export)
- **Vercel** (Deployment)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Supabase Setup

This app uses **Supabase Auth** and **Supabase Storage** — no custom database tables needed.

1. Create a Supabase project
2. Enable Email/Password auth
3. Create a storage bucket named `lesson-plans` (private)
4. Add the env vars above

The app stores:
- User profiles → Supabase Auth user metadata
- Lesson plans → Supabase Storage as JSON files (`lesson-plans/{userId}/{planId}.json`)

## Admin Account

Seed the admin account by calling the setup endpoint after first deploy:

```bash
curl -X POST https://your-domain.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"MrNorthbound@gmail.com","password":"Jade@12!","name":"Admin"}'
```

Or use the Supabase Dashboard to create the user and set `role: "admin"` in user_metadata.

## Development

```bash
npm install
npm run dev
```

## Deployment (Vercel)

```bash
vercel --prod
```

Add all env vars to Vercel dashboard.

## Pricing

- $49/year individual
- $29/seat/year for 50+ seat district licenses
- $5 burst pack = 5 additional plans (roll over)
- 5 bonus plans per referral (roll over)
- Base: 15 plans/month (don't roll over)

## Features

- ✅ Grade, subject, state standards, topic selection
- ✅ AI-generated lesson plans in ~30 seconds
- ✅ Objectives, activities, materials, rubric, differentiation
- ✅ TipTap rich text editor
- ✅ Personal lesson library (Supabase Storage)
- ✅ PDF export (client-side jsPDF)
- ✅ Usage metering (15/month base)
- ✅ Burst packs
- ✅ Referral program
- ✅ Admin dashboard
- ✅ Mobile-first responsive design
- ✅ Unsplash imagery throughout
