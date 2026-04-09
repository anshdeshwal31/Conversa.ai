import { useUsage } from '@/app/contexts/UsageContext'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import React from 'react'

interface ChatInputProps {
    chatInput: string
    onInputChange: (value: string) => void
    onSendMessage: () => void
    isLoading: boolean
}

function ChatInput({
    chatInput,
    onInputChange,
    onSendMessage,
    isLoading
}: ChatInputProps) {

    const { canChat, usage, limits, loading } = useUsage()
    const { userId } = useAuth()

    const isLoggedOut = !userId
    const disableForPlanLimit = !isLoggedOut && !loading && !canChat
    const inputDisabled = isLoading || disableForPlanLimit

    const dailyLimitReached = Boolean(
        usage &&
        limits.chatMessages !== -1 &&
        usage.chatMessagesToday >= limits.chatMessages
    )
    const showLimitNotice = !loading && !isLoggedOut && dailyLimitReached

    return (
        <div className='p-6 border-t border-white/10 bg-[#07101c]/78'>
            {showLimitNotice && usage && (
                <div className='max-w-4xl mx-auto mb-4 glass-card rounded-2xl p-3 border-white/[0.16]'>
                    <p className='text-sm text-white/75 text-center'>
                        Daily limit reached ({usage.chatMessagesToday}/{limits.chatMessages} messages used).
                        <a href="/pricing" className='underline ml-1 font-medium hover:text-white transition-colors'>See pricing details</a>.
                        Starter is free, and Pro/Premium are coming soon.
                    </p>
                </div>
            )}

            <div className='flex gap-3 max-w-4xl mx-auto'>
                <div className='flex-1 relative'>
                    <input
                        type='text'
                        value={chatInput}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder={isLoggedOut
                                ? 'Ask anything about meetings. We\'ll guide you to sign in to unlock full AI context.'
                                : !loading && !canChat
                                ? 'Daily chat limit reached for your current plan. Check Pricing for details.'
                                : canChat
                                ? 'Ask about any meeting — deadlines, decisions, action items, participants...'
                                : 'Checking plan limits...'}
                        className='w-full bg-[linear-gradient(120deg,rgba(5,8,13,0.95),rgba(9,13,21,0.93)_48%,rgba(14,10,18,0.94))] border border-white/[0.14] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-white/32 focus:outline-none focus:border-primary/55 focus:shadow-[0_0_28px_rgba(44,225,196,0.16)] transition-all duration-300'
                        disabled={inputDisabled}
                    />
                </div>

                <Button
                    onClick={onSendMessage}
                    disabled={inputDisabled}
                    className='mono-btn-solid rounded-2xl px-5 py-3.5 h-auto cursor-pointer'
                >
                    <Send className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}

export default ChatInput
