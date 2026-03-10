import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles, Clock, BookOpen, CheckCircle, Users, Star,
  ArrowRight, Zap, Globe, FileText, Share2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
            alt="Classroom with students"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/70 to-purple-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Lesson Planning
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Lesson Plans in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300"> 30 Seconds</span>,
              Not 8 Hours
            </h1>
            
            <p className="text-lg sm:text-xl text-indigo-100 mb-8 leading-relaxed">
              LessonDeck uses AI to generate fully standards-aligned, differentiated lesson plans 
              tailored to your grade, subject, and state. Spend less time planning, more time teaching.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-base sm:text-lg min-h-[56px]"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center justify-center gap-2 border border-indigo-400 text-indigo-100 font-medium px-8 py-4 rounded-xl hover:bg-indigo-800/50 transition-colors text-base sm:text-lg min-h-[56px]"
              >
                See How It Works
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-8 text-sm text-indigo-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                15 plans/month included
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                All 50 state standards
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Export to PDF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Trusted by <strong className="text-gray-800">2,400+</strong> teachers</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-1"><strong className="text-gray-800">4.9/5</strong> rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Saves <strong className="text-gray-800">8+ hours</strong>/week</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              From Topic to Lesson Plan in 3 Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No more hours spent on planning. LessonDeck handles the heavy lifting so you can focus on what matters — your students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: '01',
                icon: BookOpen,
                title: 'Set Your Parameters',
                desc: 'Choose your grade, subject, state standards, and topic. Takes about 30 seconds.',
                img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
                imgAlt: 'Teacher at desk with laptop',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI Generates Your Plan',
                desc: 'Our AI creates a complete, standards-aligned lesson plan with objectives, activities, and rubrics.',
                img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80',
                imgAlt: 'AI generation concept',
              },
              {
                step: '03',
                icon: FileText,
                title: 'Edit, Save & Share',
                desc: 'Customize with our rich text editor, save to your library, and export to PDF or Google Classroom.',
                img: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&q=80',
                imgAlt: 'Teacher sharing document',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={item.img}
                    alt={item.imgAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{item.step}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">
                Everything a Teacher Needs, Nothing They Don&apos;t
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Every lesson plan includes everything required for a successful class — ready to use in minutes, not hours.
              </p>

              <div className="space-y-4">
                {[
                  { icon: CheckCircle, title: 'Standards Alignment', desc: 'Automatically aligned to your state\'s standards for each grade and subject' },
                  { icon: Users, title: 'Differentiation Strategies', desc: 'Built-in ELL, IEP/504, and gifted learner accommodations' },
                  { icon: Zap, title: 'Assessment Rubrics', desc: 'Complete grading rubrics with clear success criteria' },
                  { icon: Globe, title: 'All 50 States', desc: 'Standards database covers every US state and district' },
                  { icon: Share2, title: 'Export & Share', desc: 'PDF export and Google Classroom integration built in' },
                  { icon: BookOpen, title: 'Personal Library', desc: 'Save, organize, and reuse all your lesson plans' },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
                  alt="Teacher using LessonDeck on tablet in classroom"
                  width={800}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
              {/* Floating stats cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">30s</div>
                    <div className="text-xs text-gray-500">avg generation time</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15+</div>
                    <div className="text-xs text-gray-500">plans per month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Teachers Love LessonDeck
            </h2>
            <p className="text-indigo-300 text-lg">Real feedback from real classrooms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: '5th Grade Teacher, Texas',
                text: 'I used to spend Sunday nights planning lessons. Now I do it in 10 minutes on Friday. The standards alignment is spot-on for TEKS.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
              },
              {
                name: 'David K.',
                role: '8th Grade Science, Ohio',
                text: 'The differentiation strategies are what sold me. I have 8 IEP students and the accommodations LessonDeck generates are actually useful.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
              },
              {
                name: 'Maria L.',
                role: 'High School English, California',
                text: 'Our whole department switched to LessonDeck. The district bulk pricing made it easy to get admin buy-in. Best $29/seat I\'ve seen.',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
              },
            ].map((t) => (
              <div key={t.name} className="bg-indigo-900/50 border border-indigo-800 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-indigo-100 mb-6 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-indigo-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Teacher-Friendly Pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Annual pricing built for school budgets and PO workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Plan */}
            <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Individual Teacher</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-500 pb-1">/year</span>
                </div>
                <p className="text-sm text-gray-500">Billed annually · PO-friendly</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '15 AI-generated plans per month',
                  'All 50 state standards',
                  'Rich text editor & customization',
                  'Personal lesson library',
                  'PDF & Google Classroom export',
                  'Referral program (5 bonus plans)',
                  'Burst packs available ($5/5 plans)',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center bg-indigo-600 text-white font-semibold px-6 py-4 rounded-xl hover:bg-indigo-700 transition-colors min-h-[52px] flex items-center justify-center"
              >
                Start Free Trial
              </Link>
            </div>

            {/* District Plan */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">District License</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-500 pb-1">/seat/year</span>
                </div>
                <p className="text-sm text-gray-500">50+ seats · Volume pricing</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Individual',
                  'District-wide administration',
                  'Centralized billing & PO',
                  'Custom standards integration',
                  'Priority support',
                  'Usage analytics dashboard',
                  'Onboarding & training',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:districts@lessondeck.app"
                className="block w-full text-center bg-gray-900 text-white font-semibold px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors min-h-[52px] flex items-center justify-center"
              >
                Contact for District Pricing
              </a>
            </div>
          </div>

          {/* Burst Pack */}
          <div className="mt-8 max-w-4xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-semibold text-gray-900">Need more plans? Get a Burst Pack</h4>
              <p className="text-sm text-gray-600 mt-1">5 additional plans for $5, and they roll over month to month. Perfect for unit planning season.</p>
            </div>
            <Link
              href="/auth/signup"
              className="bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors text-sm whitespace-nowrap min-h-[44px] flex items-center"
            >
              Get Burst Pack
            </Link>
          </div>
        </div>
      </section>

      {/* PTA Integration */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-teal-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                PTA Fundraiser Integration
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Bring LessonDeck to Your Whole School
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Partner with your PTA to run a LessonDeck fundraiser. Schools get discounted licenses, 
                teachers get better tools, and PTAs earn revenue for school programs.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Discounted school-wide licenses',
                  'Revenue sharing for PTA organizations',
                  'Easy group enrollment',
                  'Admin reporting dashboard',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:pta@lessondeck.app"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors min-h-[48px]"
              >
                Learn About PTA Partnership
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=800&q=80"
                alt="PTA meeting and school community"
                width={600}
                height={400}
                className="w-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6">
            Ready to Reclaim Your Weekends?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of teachers who&apos;ve cut lesson planning time by 80%. 
            Start your free trial today — no setup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg min-h-[56px]"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-indigo-200 text-sm mt-6">
            $49/year · 15 plans/month · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">LessonDeck</span>
              </div>
              <p className="text-sm">AI-powered lesson planning for K-12 teachers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@lessondeck.app" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="mailto:districts@lessondeck.app" className="hover:text-white transition-colors">District Sales</a></li>
                <li><a href="mailto:pta@lessondeck.app" className="hover:text-white transition-colors">PTA Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IP Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            <p>© 2026 LessonDeck. All rights reserved. Generated content is the property of LessonDeck and licensed to users for classroom use only. Redistribution or resale is prohibited.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
