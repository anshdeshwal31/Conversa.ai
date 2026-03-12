'use client'

import React from 'react'
import { useMeetings } from './hooks/useMeetings'
import { useRouter } from 'next/navigation'
import PastMeetings from './components/PastMeetings'
import UpcomingMeetings from './components/UpcomingMeetings'

function Home() {

    const {
        userId,
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
    if (!userId) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#07070B]'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-white/50 text-sm'>Loading...</span>
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
                            <span className='section-kicker'>Workspace</span>
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

export default Home
