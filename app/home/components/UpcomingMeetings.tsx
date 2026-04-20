import React from 'react'
import { CalendarEvent } from '../hooks/useMeetings'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import RippleLoader from '@/components/ui/ripple-loader'

interface UpcomingMeetingsProps {
    upcomingEvents: CalendarEvent[]
    connected: boolean
    error: string
    loading: boolean
    initialLoading: boolean
    botToggles: { [key: string]: boolean }
    onRefresh: () => void
    onToggleBot: (eventId: string) => void
    onConnectCalendar: () => void
}

function UpcomingMeetings({
    upcomingEvents,
    connected,
    error,
    loading,
    initialLoading,
    botToggles,
    onRefresh,
    onToggleBot,
    onConnectCalendar
}: UpcomingMeetingsProps) {
    return (
        <div className='glass-card p-5 md:p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-white'>Upcoming</h2>
                <span className='text-sm text-white/60 bg-white/[0.06] border border-white/15 px-2.5 py-0.5 rounded-full'>{upcomingEvents.length}</span>
            </div>

            {error && (
                <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm'>
                    {error}
                </div>
            )}

            {initialLoading ? (
                <div className='rounded-2xl border border-white/10 bg-[#151017] p-6'>
                    <div className='animate-pulse'>
                        <div className='w-12 h-12 mx-auto bg-white/[0.06] rounded-full mb-3'></div>
                        <div className='h-4 bg-white/[0.06] rounded w-3/4 mx-auto mb-2'></div>
                        <div className='h-3 bg-white/[0.06] rounded w-1/2 mx-auto mb-4'></div>
                        <div className='h-8 bg-white/[0.06] rounded-xl w-full'></div>
                    </div>
                </div>
            ) : !connected ? (
                <div className='rounded-2xl border border-white/10 bg-[#151017] p-6 text-center'>
                    <div className='w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4'>
                        <Calendar className='w-7 h-7 text-white/70' />
                    </div>
                    <h3 className='font-semibold mb-2 text-white text-sm'>Connect Calendar</h3>
                    <p className='text-white/40 mb-5 text-xs leading-relaxed'>
                        Connect Google Calendar to see upcoming meetings
                    </p>

                    <Button
                        onClick={onConnectCalendar}
                        disabled={loading}
                        className='w-full rounded-xl text-sm cursor-pointer mono-btn-solid'
                    >
                        {loading ? 'Connecting...' : 'Connect Google Calendar'}
                    </Button>
                </div>
            ) : upcomingEvents.length === 0 ? (
                <div className='rounded-2xl border border-white/10 bg-[#151017] p-6 text-center'>
                    <div className='w-14 h-14 mx-auto rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4'>
                        <Calendar className='w-7 h-7 text-white/30' />
                    </div>
                    <h3 className='font-medium mb-2 text-white text-sm'>
                        No upcoming meetings
                    </h3>
                    <p className='text-white/40 text-xs'>
                        Your calendar is clear!
                    </p>
                </div>
            ) : (
                <div className='space-y-3'>
                    <Button
                        className='w-full rounded-xl bg-[#20111c] border border-primary/24 hover:bg-[#2a1524] text-white/70 hover:text-white text-sm mb-4 cursor-pointer transition-all'
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        {loading ? (
                            <RippleLoader size={14} className='mr-2' />
                        ) : (
                            <RefreshCw className='w-3.5 h-3.5 mr-2' />
                        )}
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                    {upcomingEvents.map((event) => (
                        <div key={event.id} className='glass-card-hover rounded-2xl p-4 relative'>
                            <div className='absolute top-4 right-4'>
                                <Switch
                                    checked={!!botToggles[event.id]}
                                    onCheckedChange={() => onToggleBot(event.id)}
                                    aria-label='Toggle bot for this meeting'
                                    className='cursor-pointer'
                                />
                            </div>
                            <h4 className='font-medium text-sm text-white mb-2 pr-12'>{event.summary || 'No Title'}</h4>
                            <div className='space-y-1.5 text-xs text-white/40'>
                                <div className='flex items-center gap-1.5'>
                                    <Clock className='w-3 h-3 text-white/30' />
                                    {format(new Date(event.start?.dateTime || event.start?.date || ''), 'MMM d, h:mm a')}
                                </div>
                                {event.attendees && (
                                    <div className='flex items-center gap-1.5'>
                                        <span className='text-white/30'>👥</span>
                                        {event.attendees.length} attendees
                                    </div>
                                )}
                            </div>
                            {(event.hangoutLink || event.location) && (
                                <a
                                    href={event.hangoutLink || event.location || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <Button className='mt-3 w-full bg-white text-black hover:opacity-90 text-xs rounded-xl h-7 cursor-pointer'>
                                        Join Meeting
                                    </Button>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UpcomingMeetings
