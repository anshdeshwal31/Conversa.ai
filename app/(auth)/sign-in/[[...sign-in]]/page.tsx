import { SignIn } from '@clerk/nextjs'
import { ArrowLeft, Orbit, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { authClerkAppearance } from '../../components/clerk-auth-appearance'

const trustSignals = [
    {
        title: 'Private by design',
        description: 'Your transcripts, decisions, and tasks stay scoped to your workspace.',
    },
    {
        title: 'Fast workspace access',
        description: 'Jump back into meetings, summaries, and AI chat in seconds.',
    },
    {
        title: 'Slack and PM sync ready',
        description: 'Post meeting outcomes to Slack, Jira, Asana, and Trello from one place.',
    },
]

export default function Page() {
    return (
        <div className='min-h-[calc(100vh-120px)] px-3 pb-8 md:px-5'>
            <div className='surface-frame ambient-panel max-w-[1320px] mx-auto p-5 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden'>
                <div className='hero-glow hero-glow-teal top-[-14%] right-[-10%] w-[220px] h-[170px] sm:w-[280px] sm:h-[220px] md:w-[360px] md:h-[300px]' />
                <div className='hero-glow hero-glow-rose bottom-[-18%] left-[-8%] w-[200px] h-[160px] sm:w-[240px] sm:h-[210px] md:w-[300px] md:h-[260px]' />

                <div className='relative z-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch'>
                    <div className='glass-card p-6 md:p-8 lg:p-10 reveal-up'>
                        <Link href='/' className='mono-btn inline-flex items-center gap-2 text-xs md:text-sm'>
                            <ArrowLeft className='w-4 h-4' />
                            Back to home
                        </Link>

                        <div className='mt-6'>
                            <div className='section-kicker'>
                                <Orbit className='w-3.5 h-3.5 text-primary' />
                                Welcome back
                            </div>
                            <h1 className='text-3xl md:text-5xl font-semibold text-white leading-[1.05] mt-5'>
                                Continue where your
                                <span className='accent-text'> meetings left off.</span>
                            </h1>
                            <p className='text-white/62 text-sm md:text-base mt-4 max-w-xl'>
                                Sign in to open your workspace, review meeting intelligence, and drive follow-up with AI.
                            </p>
                        </div>

                        <div className='mt-8 space-y-3'>
                            {trustSignals.map((signal) => (
                                <div key={signal.title} className='rounded-2xl border border-white/12 bg-[#0d1626]/72 p-4'>
                                    <div className='flex items-start gap-3'>
                                        <div className='w-8 h-8 rounded-xl border border-white/20 bg-white/[0.05] flex items-center justify-center mt-0.5'>
                                            <ShieldCheck className='w-4 h-4 text-white/80' />
                                        </div>
                                        <div>
                                            <h3 className='text-white font-medium text-sm md:text-base'>{signal.title}</h3>
                                            <p className='text-white/55 text-xs md:text-sm mt-1'>{signal.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='surface-frame p-5 md:p-7 lg:p-8 reveal-up [animation-delay:120ms] flex flex-col justify-center'>
                        <div className='w-full overflow-hidden'>
                            <div className='mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/58'>
                                <Sparkles className='w-3.5 h-3.5 text-primary' />
                                Convorbit access
                            </div>
                            <SignIn
                                routing='path'
                                path='/sign-in'
                                signUpUrl='/sign-up'
                                appearance={authClerkAppearance}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}