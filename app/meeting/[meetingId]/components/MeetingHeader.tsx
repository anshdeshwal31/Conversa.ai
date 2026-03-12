import { Check, Eye, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface MeetingHeaderProps {
    title: string
    meetingId?: string
    summary?: string
    actionItems?: string
    isOwner: boolean
    isLoading?: boolean
}

function MeetingHeader({
    title,
    meetingId,
    summary,
    actionItems,
    isOwner,
    isLoading = false
}: MeetingHeaderProps) {
    const [isPosting, setIsPosting] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handlePostToSlack = async () => {
        if (!meetingId) {
            return
        }

        try {
            setIsPosting(true)

            toast("✅ Posted to Slack", {
                action: {
                    label: "OK",
                    onClick: () => { },
                },
            })
            const response = await fetch('/api/slack/post-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meetingId: meetingId,
                    summary: summary || 'Meeting summary not available',
                    actionItems: actionItems || 'No action items recorded'
                })
            })

            const result = await response.json()

            if (response.ok) {

            } else {

            }
        } catch (error) {

        } finally {
            setIsPosting(false)
        }
    }

    const handleShare = async () => {
        if (!meetingId) {
            return
        }

        try {
            const shareUrl = `${window.location.origin}/meeting/${meetingId}`
            await navigator.clipboard.writeText(shareUrl)

            setCopied(true)
            toast("✅ Meeting link copied!", {
                action: {
                    label: "OK",
                    onClick: () => { },
                },
            })

            setTimeout(() => setCopied(false), 2000)

        } catch (error) {
            console.error('failed to copy:', error)

        }
    }

    const handleDelete = async () => {
        if (!meetingId) {
            return
        }

        try {
            setIsDeleting(true)
            toast("✅ Meeting Deleted", {
                action: {
                    label: "OK",
                    onClick: () => { },
                },
            })
            const response = await fetch(`/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (response.ok) {
                router.push('/home')
            } else {

            }

        } catch (error) {
            console.error('delete error', error)

        } finally {
            setIsDeleting(false)
        }
    }
    return (
        <div className='bg-[#0F0F15] border-b border-white/[0.08] px-6 py-3.5 flex justify-between items-center'>
            <h1 className='text-xl font-semibold text-white'>
                {title}
            </h1>

            {isLoading ? (
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
                    Loading...
                </div>
            ) : isOwner ? (
                <div className='flex gap-3'>
                    <button
                        onClick={handlePostToSlack}
                        disabled={isPosting || !meetingId}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        <img
                            src="/slack.png"
                            alt="Slack"
                            className='w-4 h-4'
                        />
                        {isPosting ? 'Posting...' : 'Post to Slack'}
                    </button>

                    <button
                        onClick={handleShare}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.1] transition-colors cursor-pointer'
                    >
                        {copied ? (
                            <>
                                <Check className='h-4 w-4 text-white' />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className='h-4 w-4' />
                                Share
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        <Trash2 className='h-4 w-4' />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            ) : (
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Eye className='w-4 h-4' />
                    Viewing shared meeting
                </div>
            )}
        </div>
    )
}

export default MeetingHeader
