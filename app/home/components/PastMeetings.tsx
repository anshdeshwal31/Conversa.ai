import React from 'react'
import { PastMeeting } from '../hooks/useMeetings'
import { Clock, ExternalLink, Video } from 'lucide-react'
import AttendeeAvatars from './AttendeeAvatars'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

interface PastMeetingsProps {
    pastMeetings: PastMeeting[]
    pastLoading: boolean
    onMeetingClick: (id: string) => void
    getAttendeeList: (attendees: any) => string[]
    getInitials: (name: string) => string
}

function PastMeetings({
    pastMeetings,
    pastLoading,
    onMeetingClick,
    getAttendeeList,
    getInitials
}: PastMeetingsProps) {

    if (pastLoading) {
        return (
            <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                    <div key={i} className='glass-card rounded-2xl p-5 animate-pulse'>
                        <div className='flex justify-between items-start mb-3'>
                            <div className='flex items-center gap-3 flex-1'>
                                <div className='h-6 bg-white/[0.06] rounded-lg w-48'></div>
                                <div className='flex -space-x-2'>
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className='w-6 h-6 rounded-full bg-white/[0.06]'></div>
                                    ))}
                                </div>
                            </div>
                            <div className='h-5 bg-white/[0.06] rounded-full w-20'></div>
                        </div>
                        <div className='h-4 bg-white/[0.06] rounded w-3/4 mb-3'></div>
                        <div className='h-4 bg-white/[0.06] rounded w-1/2 mb-3'></div>
                        <div className='h-6 bg-white/[0.06] rounded-lg w-24'></div>
                    </div>
                ))}
            </div>
        )
    }

    if (pastMeetings.length === 0) {
        return (
            <div className='glass-card rounded-2xl p-10 text-center'>
                <div className='w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4'>
                    <Video className='h-8 w-8 text-white/60' />
                </div>
                <h3 className='text-lg font-semibold mb-2 text-white'>No past meetings</h3>
                <p className='text-white/40 text-sm'>Your completed meetings will appear here</p>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            {pastMeetings.map((meeting) => (
                <div
                    key={meeting.id}
                    className='glass-card glass-card-hover rounded-2xl p-5 cursor-pointer'
                    onClick={() => onMeetingClick(meeting.id)}
                >
                    <div className='flex justify-between items-start mb-3'>
                        <div className='flex items-center gap-3 flex-1'>
                            <h3 className='font-semibold text-lg text-white'>
                                {meeting.title}
                            </h3>
                            {meeting.attendees && (
                                <AttendeeAvatars
                                    attendees={meeting.attendees}
                                    getAttendeeList={getAttendeeList}
                                    getInitials={getInitials}
                                />
                            )}
                        </div>
                        <span className='text-xs bg-primary/18 text-primary px-2.5 py-1 rounded-full border border-primary/30 font-medium'>
                            Completed
                        </span>
                    </div>
                    {meeting.description && (
                        <p className='text-sm text-white/40 mb-3'>{meeting.description}</p>
                    )}

                    <div className='text-sm text-white/40 mb-3'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-white/30' />
                            <span>
                                {format(new Date(meeting.startTime), 'PPp')} - {format(new Date(meeting.endTime), 'pp')}
                            </span>
                        </div>
                    </div>

                    <div
                        className='flex gap-2 mt-4'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            className='flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0e1f32] hover:bg-[#102841] border border-primary/25 text-xs rounded-lg h-8 cursor-pointer text-white'
                            onClick={() => onMeetingClick(meeting.id)}
                        >
                            <ExternalLink className='h-3 w-3' />
                            View Details
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default PastMeetings
