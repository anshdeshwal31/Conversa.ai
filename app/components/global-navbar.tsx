'use client'

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import PillNav from '@/components/reactbits/pill-nav'
import { Menu, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Home', href: '/home' },
  { label: 'Chat', href: '/chat' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Settings', href: '/settings' },
]

export function GlobalNavbar() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [open, setOpen] = useState(false)

  const closeMobile = () => setOpen(false)

  return (
    <header className='sticky top-0 z-50 px-4 py-4 md:py-5'>
      <div className='surface-frame max-w-[1320px] mx-auto px-4 py-3 md:px-6'>
        <div className='flex items-center justify-between gap-4'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl border border-primary/40 bg-primary/20 flex items-center justify-center animate-pulse-glow'>
              <Sparkles className='w-4 h-4 text-primary' />
            </div>
            <span className='text-sm font-semibold tracking-wide text-white'>
              Convorbit AI
              <span className='text-primary ml-1'>STUDIO</span>
            </span>
          </Link>

          <PillNav
            items={navItems}
            activeHref={pathname}
            className='max-md:hidden'
            baseColor='rgba(255,255,255,0.75)'
            pillColor='rgba(255,255,255,0.14)'
            hoveredPillTextColor='#ffffff'
            initialLoadAnimation
          />

          <div className='hidden md:flex items-center gap-2'>
            {isSignedIn ? (
              <UserButton afterSignOutUrl='/' />
            ) : (
              <>
                <SignInButton mode='modal'>
                  <button className='mono-btn cursor-pointer' type='button'>Sign In</button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <button className='mono-btn-solid cursor-pointer' type='button'>Create Account</button>
                </SignUpButton>
              </>
            )}
          </div>

          <button
            className='md:hidden mono-btn p-2.5'
            onClick={() => setOpen((prev) => !prev)}
            aria-label='Toggle navigation menu'
            type='button'
          >
            {open ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
          </button>
        </div>

        {open && (
          <div className='mt-4 md:hidden glass-card p-4 reveal-up'>
            <div className='grid grid-cols-2 gap-2'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`pill-nav-item ${pathname === item.href ? 'bg-primary/20 text-white border border-primary/35' : 'border border-transparent'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className='mt-3 border-t border-white/10 pt-3'>
              {isSignedIn ? (
                <div className='flex justify-end'>
                  <UserButton afterSignOutUrl='/' />
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-2'>
                  <SignInButton mode='modal'>
                    <button className='mono-btn w-full cursor-pointer' onClick={closeMobile} type='button'>
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode='modal'>
                    <button className='mono-btn-solid w-full cursor-pointer' onClick={closeMobile} type='button'>
                      Create Account
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
