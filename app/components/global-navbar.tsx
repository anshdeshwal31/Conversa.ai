'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import PillNav from '@/components/reactbits/pill-nav'
import StaggeredMenu from '@/components/reactbits/staggered-menu'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Home', href: '/home' },
  { label: 'Meetings', href: '/meeting' },
  { label: 'Chat', href: '/chat' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Settings', href: '/settings' },
]

export function GlobalNavbar() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  return (
    <header className='sticky top-0 z-50 px-4 py-4 md:py-5'>
      <div className='max-w-[1320px] mx-auto'>
        <div className='grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl border border-primary/40 bg-primary/20 flex items-center justify-center animate-pulse-glow'>
              <Sparkles className='w-4 h-4 text-primary' />
            </div>
            <span className='text-sm font-semibold tracking-wide text-white'>Convorbit AI</span>
          </Link>

          <div className='hidden md:flex justify-center'>
            <PillNav
              items={navItems}
              activeHref={pathname}
              className='w-auto'
              ease='power2.easeOut'
              baseColor='rgba(8, 10, 14, 0.9)'
              pillColor='rgba(255, 255, 255, 0.95)'
              hoveredPillTextColor='#f8fafc'
              pillTextColor='#08090c'
              initialLoadAnimation={false}
            />
          </div>

          <div className='hidden md:flex items-center gap-2'>
            {isSignedIn ? (
              <UserButton afterSignOutUrl='/' />
            ) : (
              <>
                <Link href='/sign-in' className='mono-btn cursor-pointer'>Sign In</Link>
                <Link href='/sign-up' className='mono-btn-solid cursor-pointer'>Create Account</Link>
              </>
            )}
          </div>

          <div className='flex justify-end md:hidden'>
            <StaggeredMenu
              position='right'
              items={navItems}
              displayItemNumbering
              colors={['rgba(18, 14, 26, 0.96)', 'rgba(10, 8, 15, 0.98)']}
              menuButtonColor='rgba(248, 250, 252, 0.92)'
              openMenuButtonColor='#ffffff'
              changeMenuColorOnOpen
              accentColor='rgba(8, 10, 14, 0.9)'
              footer={isSignedIn ? (
                <div className='flex justify-end'>
                  <UserButton afterSignOutUrl='/' />
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-2'>
                  <Link href='/sign-in' className='mono-btn w-full text-center cursor-pointer'>
                    Sign In
                  </Link>
                  <Link href='/sign-up' className='mono-btn-solid w-full text-center cursor-pointer'>
                    Create Account
                  </Link>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
