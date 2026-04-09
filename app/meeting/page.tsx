'use client'

import PastMeetings from '@/app/home/components/PastMeetings'
import UpcomingMeetings from '@/app/home/components/UpcomingMeetings'
import { useMeetings } from '@/app/home/hooks/useMeetings'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight, CalendarCheck2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

function MeetingsPage() {
    const { userId, isLoaded } = useAuth()
    const {
        upcomingEvents,
        pastMeetings,
        loading,
        pastLoading,
        connected,
        error,
        botToggles,
        initialLoading,
        fetchUpcomingEvents,
        toggleBot,
        directOAuth,
        getAttendeeList,
        getInitials
    } = useMeetings()

    const router = useRouter()

    const handleMeetingClick = (meetingId: string) => {
        router.push(`/meeting/${meetingId}`)
    }

    if (!isLoaded) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#07070B]'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-white/50 text-sm'>Loading...</span>
                </div>
            </div>
        )
    }

    if (!userId) {
        return (
            <div className='min-h-screen'>
                <div className='surface-frame ambient-panel p-6 md:p-10'>
                    <div className='max-w-2xl mx-auto glass-card p-7 md:p-10 text-center'>
                        <div className='w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-5'>
                            <CalendarCheck2 className='w-7 h-7 text-primary' />
                        </div>

                        <span className='section-kicker inline-flex'>Meetings</span>
                        <h1 className='text-2xl md:text-3xl font-semibold text-white mt-5'>
                            Log in to schedule your meeting bot
                        </h1>
                        <p className='text-white/62 text-sm md:text-base mt-3'>
                            Connect your calendar, auto-join upcoming calls, and get summaries with action items after each meeting.
                        </p>

                        <div className='mt-7 flex flex-wrap items-center justify-center gap-3'>
                            <Link href='/sign-in' className='mono-btn-solid cursor-pointer inline-flex items-center gap-2'>
                                Log In and Schedule Bot
                                <ArrowRight className='w-4 h-4' />
                            </Link>

                            <Link href='/sign-up' className='mono-btn cursor-pointer'>
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen'>
            <div className='surface-frame p-4 md:p-6 lg:p-7 ambient-panel'>
                <div className='flex flex-col lg:flex-row gap-5'>
                    <div className='flex-1'>
                        <div className='mb-6'>
                            <span className='section-kicker'>Meetings</span>
                            <h2 className='text-2xl md:text-3xl font-semibold text-white mt-4'>
                                Past Meetings
                            </h2>
                            <p className='text-white/58 text-sm mt-1'>Review summaries, action items, and execution context.</p>
                        </div>
                        <PastMeetings
                            pastMeetings={pastMeetings}
                            pastLoading={pastLoading}
                            onMeetingClick={handleMeetingClick}
                            getAttendeeList={getAttendeeList}
                            getInitials={getInitials}
                        />
                    </div>

                    <div className='lg:w-[360px] xl:w-[390px]'>
                        <div className='sticky top-4'>
                            <UpcomingMeetings
                                upcomingEvents={upcomingEvents}
                                connected={connected}
                                error={error}
                                loading={loading}
                                initialLoading={initialLoading}
                                botToggles={botToggles}
                                onRefresh={fetchUpcomingEvents}
                                onToggleBot={toggleBot}
                                onConnectCalendar={directOAuth}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MeetingsPage
