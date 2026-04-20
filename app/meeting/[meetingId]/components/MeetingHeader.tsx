import { Check, Eye, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import RippleLoader from '@/components/ui/ripple-loader'

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

            const result = await response.json().catch(() => ({}))

            if (response.ok) {
                toast.success('Posted to Slack', {
                    description: result.message || 'Meeting summary was sent to your Slack channel.'
                })
            } else {
                toast.error('Failed to post to Slack', {
                    description: result.error || 'Please reconnect Slack or choose a valid channel in Integrations.'
                })
            }
        } catch (error) {
            console.error('slack post error:', error)
            toast.error('Failed to post to Slack', {
                description: 'Something went wrong while posting. Please try again.'
            })
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
            toast.success('Meeting link copied', {
                description: 'Shareable meeting link was copied to your clipboard.'
            })

            setTimeout(() => setCopied(false), 2000)

        } catch (error) {
            console.error('failed to copy:', error)
            toast.error('Failed to copy meeting link', {
                description: 'Please try copying the link again.'
            })

        }
    }

    const handleDelete = async () => {
        if (!meetingId) {
            return
        }

        try {
            setIsDeleting(true)
            const response = await fetch(`/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json().catch(() => ({}))

            if (response.ok) {
                toast.success('Meeting deleted', {
                    description: result.message || 'The meeting was deleted successfully.'
                })
                router.push('/meeting')
            } else {
                toast.error('Failed to delete meeting', {
                    description: result.error || 'Please try again in a moment.'
                })
            }

        } catch (error) {
            console.error('delete error', error)
            toast.error('Failed to delete meeting', {
                description: 'Something went wrong while deleting. Please try again.'
            })

        } finally {
            setIsDeleting(false)
        }
    }
    return (
        <div className='bg-[#0F0F15] border-b border-white/[0.08] px-4 md:px-6 py-3.5 flex flex-col gap-3 md:flex-row md:justify-between md:items-center'>
            <h1 className='text-lg md:text-xl font-semibold text-white break-words'>
                {title}
            </h1>

            {isLoading ? (
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <RippleLoader size={16} className='opacity-80' />
                    Loading...
                </div>
            ) : isOwner ? (
                <div className='flex flex-wrap gap-2 md:gap-3 justify-start md:justify-end w-full md:w-auto'>
                    <button
                        onClick={handlePostToSlack}
                        disabled={isPosting || !meetingId}
                        className='inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-xs md:text-sm hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
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
                        className='inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-xs md:text-sm hover:bg-white/[0.1] transition-colors cursor-pointer'
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
                        className='inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
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
