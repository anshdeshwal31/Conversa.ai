import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import React from 'react'

const productLinks = [
    { label: 'Meetings', href: '/meeting' },
    { label: 'AI Chat', href: '/chat' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Pricing', href: '/pricing' }
]

const resourceLinks = [
    { label: 'Home', href: '/home' },
    { label: 'Workspace Settings', href: '/settings' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Create Account', href: '/sign-up' }
]

const companyLinks = [
    { label: 'About Convorbit', href: '/' },
    { label: 'Contact', href: 'mailto:hello@convorbit.ai', external: true },
    { label: 'Privacy', href: '/', external: false }
]

const socialLinks = [
    {
        label: 'X',
        href: 'https://x.com',
        icon: (
            <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
                <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' />
            </svg>
        )
    },
    {
        label: 'GitHub',
        href: 'https://github.com',
        icon: (
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
                <path d='M9 18c-4.51 2-5-2-7-2' />
            </svg>
        )
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com',
        icon: (
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
                <rect width='4' height='12' x='2' y='9' />
                <circle cx='4' cy='4' r='2' />
            </svg>
        )
    },
    {
        label: 'YouTube',
        href: 'https://www.youtube.com',
        icon: (
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' />
                <path d='m10 15 5-3-5-3z' />
            </svg>
        )
    }
]

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className='px-1 pt-8 md:px-2'>
            <div className='max-w-[1320px] mx-auto rounded-t-[2rem] border border-white/[0.14] bg-[#111017]/94 px-5 pt-8 pb-5 sm:px-8 md:px-12 lg:px-16 overflow-hidden relative'>
                <div className='hero-glow hero-glow-teal top-[-16%] right-[-10%] w-[220px] h-[160px] sm:w-[280px] sm:h-[220px] md:w-[340px] md:h-[260px]' />
                <div className='hero-glow hero-glow-rose bottom-[-20%] left-[-12%] w-[220px] h-[180px] sm:w-[300px] sm:h-[230px] md:w-[360px] md:h-[280px]' />

                <div className='relative z-10 grid grid-cols-1 lg:grid-cols-6 gap-9 md:gap-12'>
                    <div className='lg:col-span-3 space-y-6'>
                        <Link href='/' className='inline-flex items-center gap-3'>
                            <div className='w-9 h-9 rounded-xl border border-primary/40 bg-primary/20 flex items-center justify-center'>
                                <Sparkles className='w-4.5 h-4.5 text-primary' />
                            </div>
                            <span className='text-xl font-semibold tracking-wide text-white'>Convorbit AI</span>
                        </Link>

                        <p className='text-sm/6 text-white/62 max-w-md'>
                            Convorbit AI turns every meeting into clear summaries, action items, and execution-ready context,
                            so teams move from discussion to delivery without losing momentum.
                        </p>

                        <div className='flex gap-5 md:gap-6'>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    aria-label={social.label}
                                    className='text-white/88 hover:text-white transition-colors'
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className='lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start'>
                        <div>
                            <h3 className='font-medium text-sm mb-4 text-white/88'>Product</h3>
                            <ul className='space-y-3 text-sm text-white/58'>
                                {productLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className='hover:text-white/80 transition-colors'>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className='font-medium text-sm mb-4 text-white/88'>Resources</h3>
                            <ul className='space-y-3 text-sm text-white/58'>
                                {resourceLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className='hover:text-white/80 transition-colors'>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                            <h3 className='font-medium text-sm mb-4 text-white/88'>Company</h3>
                            <ul className='space-y-3 text-sm text-white/58'>
                                {companyLinks.map((link) => (
                                    <li key={link.label}>
                                        {link.external ? (
                                            <a href={link.href} className='hover:text-white/80 transition-colors'>
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link href={link.href} className='hover:text-white/80 transition-colors'>
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                                <li className='flex items-center gap-2'>
                                    <span className='text-white/58'>Careers</span>
                                    <span className='text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/16 border border-emerald-300/45 text-emerald-300'>
                                        HIRING
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className='relative z-10 mt-12 pt-4 border-t border-white/[0.14] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                    <p className='text-white/45 text-sm'>© {currentYear} Convorbit AI</p>
                    <p className='text-sm text-white/45'>All rights reserved.</p>
                </div>

                <div className='relative mt-4'>
                    <div className='absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl h-full max-h-52 bg-white/10 rounded-full blur-[135px] pointer-events-none' />
                    <h3 className='text-center font-extrabold leading-[0.7] text-transparent text-[clamp(3rem,15vw,11rem)] [-webkit-text-stroke:1px_rgba(221,227,236,0.38)] mt-6 select-none'>
                        CONVORBIT
                    </h3>
                </div>
            </div>
        </footer>
    )
}

export default Footer
