'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, BookOpen, Plus, Library, Settings, LogOut, LayoutDashboard, Shield } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const navLinks = session ? [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create', label: 'New Plan', icon: Plus },
    { href: '/library', label: 'My Library', icon: Library },
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(session.user.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ] : []

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">LessonForge</span>
          </Link>

          {/* Desktop Nav */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="hidden md:block text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors min-h-[40px] flex items-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && session && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <div className="text-sm text-gray-500 py-2 px-3">
              {session.user.name || session.user.email}
            </div>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors min-h-[44px]"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
