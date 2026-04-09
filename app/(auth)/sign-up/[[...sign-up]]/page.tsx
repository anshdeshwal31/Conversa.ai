import { SignUp } from '@clerk/nextjs'
import { ArrowLeft, Orbit, Sparkles, Workflow } from 'lucide-react'
import Link from 'next/link'
import { authClerkAppearance } from '../../components/clerk-auth-appearance'

const starterHighlights = [
    'Capture and summarize meetings automatically',
    'Extract action items and sync into your tools',
    'Search all meeting knowledge with AI chat',
]

export default function Page() {
    return (
        <div className='min-h-[calc(100vh-120px)] px-3 pb-8 md:px-5'>
            <div className='surface-frame ambient-panel max-w-[1320px] mx-auto p-6 md:p-8 lg:p-10 relative overflow-hidden'>
                <div className='hero-glow hero-glow-teal top-[-24%] right-[-8%] w-[420px] h-[320px]' />
                <div className='hero-glow hero-glow-rose bottom-[-34%] left-[-10%] w-[340px] h-[280px]' />

                <div className='relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch'>
                    <div className='glass-card p-6 md:p-8 lg:p-10 reveal-up'>
                        <Link href='/' className='mono-btn inline-flex items-center gap-2 text-xs md:text-sm'>
                            <ArrowLeft className='w-4 h-4' />
                            Back to home
                        </Link>

                        <div className='mt-6'>
                            <div className='section-kicker'>
                                <Orbit className='w-3.5 h-3.5 text-primary' />
                                Start your workspace
                            </div>
                            <h1 className='text-3xl md:text-5xl font-semibold text-white leading-[1.05] mt-5'>
                                Build your meeting
                                <span className='accent-text'> command center.</span>
                            </h1>
                            <p className='text-white/62 text-sm md:text-base mt-4 max-w-xl'>
                                Create your account and launch Convorbit with calendar sync, meeting AI, and action workflows.
                            </p>
                        </div>

                        <div className='mt-8 rounded-2xl border border-white/12 bg-[#0d1626]/72 p-5'>
                            <div className='flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/60 mb-3'>
                                <Workflow className='w-3.5 h-3.5 text-primary' />
                                Included from day one
                            </div>
                            <ul className='space-y-2.5'>
                                {starterHighlights.map((item) => (
                                    <li key={item} className='text-sm text-white/72 flex items-start gap-2.5'>
                                        <span className='mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70' />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className='surface-frame p-5 md:p-7 lg:p-8 reveal-up [animation-delay:120ms] flex flex-col justify-center'>
                        <div className='w-full max-w-[560px] mx-auto'>
                            <div className='mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/58'>
                                <Sparkles className='w-3.5 h-3.5 text-primary' />
                                Create account
                            </div>
                            <SignUp
                                routing='path'
                                path='/sign-up'
                                signInUrl='/sign-in'
                                appearance={authClerkAppearance}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}