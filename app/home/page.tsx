'use client'

import { Button } from '@/components/ui/button'
import { useAuth, useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import {
    ArrowRight,
    CalendarCheck2,
    CheckCircle2,
    MessageSquare,
    PlugZap,
    Settings,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useUsage } from '../contexts/UsageContext'
import { useMeetings } from './hooks/useMeetings'

function Home() {
    const { userId, isLoaded } = useAuth()
    const { user } = useUser()
    const router = useRouter()

    const {
        usage,
        limits,
        loading: usageLoading
    } = useUsage()

    const {
        upcomingEvents,
        pastMeetings,
        connected,
        initialLoading
    } = useMeetings()

    useEffect(() => {
        if (isLoaded && !userId) {
            router.replace('/')
        }
    }, [isLoaded, userId, router])

    if (!isLoaded || !userId) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#07070B]'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-white/50 text-sm'>Loading...</span>
                </div>
            </div>
        )
    }

    const meetingsUsed = usage?.meetingsThisMonth ?? 0
    const chatUsed = usage?.chatMessagesToday ?? 0

    const meetingsLimitLabel = limits.meetings === -1
        ? `${meetingsUsed} / Unlimited`
        : `${meetingsUsed} / ${limits.meetings}`

    const chatLimitLabel = limits.chatMessages === -1
        ? `${chatUsed} / Unlimited`
        : `${chatUsed} / ${limits.chatMessages}`

    const activePlan = usage?.currentPlan ? usage.currentPlan.toUpperCase() : 'STARTER'
    const nextMeeting = upcomingEvents[0]
    const nextMeetingStart = nextMeeting?.start?.dateTime || nextMeeting?.start?.date

    return (
        <div className='min-h-screen'>
            <div className='surface-frame ambient-panel p-4 md:p-7 lg:p-8'>
                <div className='space-y-6'>
                    <section className='glass-card p-6 md:p-8'>
                        <span className='section-kicker'>Home</span>
                        <div className='mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
                            <div>
                                <h1 className='text-2xl md:text-3xl font-semibold text-white'>
                                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
                                </h1>
                                <p className='text-white/60 mt-2 max-w-2xl'>
                                    Monitor meeting velocity, usage limits, and execution touchpoints from one workspace.
                                </p>
                            </div>

                            <div className='flex flex-wrap items-center gap-3'>
                                <Button asChild className='mono-btn-solid cursor-pointer'>
                                    <Link href='/meeting' className='inline-flex items-center gap-2'>
                                        Open Meetings
                                        <ArrowRight className='w-4 h-4' />
                                    </Link>
                                </Button>
                                <Button asChild className='mono-btn cursor-pointer'>
                                    <Link href='/chat'>Ask AI Across Meetings</Link>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                        <div className='glass-card p-5'>
                            <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Plan</p>
                            <p className='text-2xl font-semibold text-white'>{activePlan}</p>
                            <p className='text-white/55 text-sm mt-1'>Current workspace tier</p>
                        </div>

                        <div className='glass-card p-5'>
                            <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Meetings Used</p>
                            <p className='text-2xl font-semibold text-white'>
                                {usageLoading ? '...' : meetingsLimitLabel}
                            </p>
                            <p className='text-white/55 text-sm mt-1'>Current billing period</p>
                        </div>

                        <div className='glass-card p-5'>
                            <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Chat Messages</p>
                            <p className='text-2xl font-semibold text-white'>
                                {usageLoading ? '...' : chatLimitLabel}
                            </p>
                            <p className='text-white/55 text-sm mt-1'>Today&apos;s usage</p>
                        </div>

                        <div className='glass-card p-5'>
                            <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Calendar</p>
                            <p className='text-2xl font-semibold text-white'>
                                {connected ? 'Connected' : 'Not Connected'}
                            </p>
                            <p className='text-white/55 text-sm mt-1'>
                                {initialLoading ? 'Syncing status...' : `${upcomingEvents.length} upcoming meeting(s)`}
                            </p>
                        </div>
                    </section>

                    <section className='grid gap-4 lg:grid-cols-2'>
                        <div className='glass-card p-5 md:p-6'>
                            <h2 className='text-lg font-semibold text-white mb-4'>Quick Actions</h2>
                            <div className='grid sm:grid-cols-2 gap-3'>
                                <Link href='/meeting' className='glass-card-hover p-4 rounded-2xl border border-white/10'>
                                    <CalendarCheck2 className='w-5 h-5 text-primary mb-3' />
                                    <p className='text-sm font-semibold text-white'>Meetings Hub</p>
                                    <p className='text-xs text-white/55 mt-1'>Schedule bot and review summaries.</p>
                                </Link>

                                <Link href='/chat' className='glass-card-hover p-4 rounded-2xl border border-white/10'>
                                    <MessageSquare className='w-5 h-5 text-primary mb-3' />
                                    <p className='text-sm font-semibold text-white'>AI Chat</p>
                                    <p className='text-xs text-white/55 mt-1'>Query decisions across all meetings.</p>
                                </Link>

                                <Link href='/integrations' className='glass-card-hover p-4 rounded-2xl border border-white/10'>
                                    <PlugZap className='w-5 h-5 text-primary mb-3' />
                                    <p className='text-sm font-semibold text-white'>Integrations</p>
                                    <p className='text-xs text-white/55 mt-1'>Connect Jira, Asana, Trello, and Slack.</p>
                                </Link>

                                <Link href='/settings' className='glass-card-hover p-4 rounded-2xl border border-white/10'>
                                    <Settings className='w-5 h-5 text-primary mb-3' />
                                    <p className='text-sm font-semibold text-white'>Workspace Settings</p>
                                    <p className='text-xs text-white/55 mt-1'>Customize your AI assistant behavior.</p>
                                </Link>
                            </div>
                        </div>

                        <div className='glass-card p-5 md:p-6'>
                            <h2 className='text-lg font-semibold text-white mb-4'>Workspace Snapshot</h2>

                            <div className='space-y-3'>
                                <div className='rounded-2xl border border-white/10 bg-[#0a1322]/75 p-4'>
                                    <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Meetings Processed</p>
                                    <p className='text-2xl font-semibold text-white'>{pastMeetings.length}</p>
                                </div>

                                <div className='rounded-2xl border border-white/10 bg-[#0a1322]/75 p-4'>
                                    <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Upcoming Queue</p>
                                    <p className='text-2xl font-semibold text-white'>{upcomingEvents.length}</p>
                                </div>

                                <div className='rounded-2xl border border-white/10 bg-[#0a1322]/75 p-4'>
                                    <p className='text-xs uppercase tracking-[0.16em] text-white/45 mb-2'>Next Meeting</p>
                                    {nextMeeting && nextMeetingStart ? (
                                        <>
                                            <p className='text-sm font-semibold text-white line-clamp-1'>
                                                {nextMeeting.summary || 'Untitled meeting'}
                                            </p>
                                            <p className='text-white/58 text-xs mt-1'>
                                                {format(new Date(nextMeetingStart), 'MMM d, h:mm a')}
                                            </p>
                                        </>
                                    ) : (
                                        <p className='text-white/58 text-sm'>No upcoming meeting scheduled yet.</p>
                                    )}
                                </div>

                                <div className='rounded-2xl border border-primary/25 bg-primary/10 p-4 flex items-center justify-between gap-3'>
                                    <div>
                                        <p className='text-sm font-semibold text-white'>Move from summary to execution</p>
                                        <p className='text-xs text-white/58 mt-1'>Open Meetings to schedule bots and push tasks.</p>
                                    </div>
                                    <Sparkles className='w-5 h-5 text-primary flex-shrink-0' />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className='glass-card p-5 md:p-6'>
                        <h2 className='text-lg font-semibold text-white mb-4'>Execution Checklist</h2>
                        <div className='grid gap-3 md:grid-cols-3'>
                            <div className='flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#0a1322]/70 p-4'>
                                <CheckCircle2 className='w-4 h-4 text-primary mt-0.5' />
                                <p className='text-sm text-white/72'>Connect integrations to ship action items instantly.</p>
                            </div>
                            <div className='flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#0a1322]/70 p-4'>
                                <CheckCircle2 className='w-4 h-4 text-primary mt-0.5' />
                                <p className='text-sm text-white/72'>Keep your meeting bot scheduled for upcoming calls.</p>
                            </div>
                            <div className='flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#0a1322]/70 p-4'>
                                <CheckCircle2 className='w-4 h-4 text-primary mt-0.5' />
                                <p className='text-sm text-white/72'>Use AI chat to unblock decisions in seconds.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Home
