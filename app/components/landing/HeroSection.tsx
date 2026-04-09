'use client'

import { useUser } from "@clerk/nextjs"
import { ArrowRight, Orbit, Play } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
    const { isSignedIn } = useUser()
    return (
        <section className='px-1 pt-2 pb-12 md:px-2'>
            <div className='surface-frame ambient-panel max-w-[1320px] mx-auto min-h-[78vh] p-6 md:p-12 lg:p-16 overflow-hidden relative'>
                <div className='hero-glow hero-glow-teal top-[-16%] right-[2%] w-[540px] h-[380px]' />
                <div className='hero-glow hero-glow-rose bottom-[-18%] left-[-8%] w-[460px] h-[320px]' />
                <div className='hero-glow hero-glow-teal top-[45%] left-[36%] w-[300px] h-[220px] opacity-45' />

                <div className='relative z-10 h-full grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center'>
                    <div className='text-left reveal-up'>
                        <div className='section-kicker mb-7'>
                            <Orbit className='w-3.5 h-3.5 text-primary' />
                            End-to-End Meeting OS
                        </div>

                        <h1 className='text-4xl md:text-6xl xl:text-7xl font-semibold tracking-tight text-white leading-[1.02] max-w-4xl'>
                            The Intelligent
                            <br />
                            <span className='accent-text'>Workflow Layer</span>
                            <br />
                            For Every Meeting.
                        </h1>

                        <p className='mt-6 max-w-2xl text-white/68 text-base md:text-lg leading-relaxed'>
                            Convorbit AI Studio captures context, extracts decisions, and routes action automatically.
                            From live calls to follow-up execution, your team moves in one continuous system.
                        </p>

                        <div className='mt-10 flex flex-wrap items-center gap-3'>
                            {isSignedIn ? (
                                <Link href='/home' className='mono-btn-solid inline-flex items-center gap-2'>
                                    Open Workspace
                                    <ArrowRight className='w-4 h-4' />
                                </Link>
                            ) : (
                                <Link href='/sign-up' className='mono-btn-solid inline-flex items-center gap-2 cursor-pointer'>
                                    Start Free
                                    <ArrowRight className='w-4 h-4' />
                                </Link>
                            )}

                            {isSignedIn ? (
                                <Link href='/chat' className='mono-btn inline-flex items-center gap-2'>
                                    Explore AI Chat
                                </Link>
                            ) : (
                                <Link href='/sign-in' className='mono-btn inline-flex items-center gap-2 cursor-pointer'>
                                    <Play className='w-4 h-4' />
                                    See Product
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className='glass-card p-5 md:p-6 lg:p-7 h-full min-h-[320px] lg:min-h-[420px] flex flex-col justify-between reveal-up [animation-delay:150ms]'>
                        <div className='flex items-center justify-between text-xs text-white/65 uppercase tracking-[0.16em]'>
                            <span>Realtime Pipeline</span>
                            <span className='text-primary'>Active</span>
                        </div>
                        <div className='space-y-4'>
                            {[
                                'Capture + transcribe every call',
                                'Summarize decisions and blockers',
                                'Push actions to Jira, Asana, Slack',
                                'Query all meetings through AI chat',
                            ].map((item) => (
                                <div key={item} className='flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1626]/75 p-3'>
                                    <p className='text-sm text-white/78'>{item}</p>
                                    <span className='w-2 h-2 rounded-full bg-primary animate-pulse' />
                                </div>
                            ))}
                        </div>
                        <div className='rounded-xl border border-white/10 bg-[#0a1322]/80 p-4'>
                            <p className='text-xs uppercase tracking-[0.18em] text-white/45 mb-2'>Time Saved / Week</p>
                            <p className='text-3xl font-semibold text-white'>+11.4 hrs</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}