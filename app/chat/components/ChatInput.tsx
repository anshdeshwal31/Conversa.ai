import { useUsage } from '@/app/contexts/UsageContext'
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

    const { canChat, usage, limits } = useUsage()
    return (
        <div className='p-6 border-t border-white/10 bg-[#07101c]/78'>
            {!canChat && usage && (
                <div className='max-w-4xl mx-auto mb-4 glass-card rounded-2xl p-3 border-white/[0.16]'>
                    <p className='text-sm text-white/75 text-center'>
                        Daily limit reached ({usage.chatMessagesToday}/{limits.chatMessages} messages used).
                        <a href="/pricing" className='underline ml-1 font-medium hover:text-white transition-colors'>Upgrade your plan</a> to continue chatting.
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
                        placeholder={canChat ? 'Ask about any meeting — deadlines, decisions, action items, participants...' : 'Daily chat limit reached — upgrade to continue'}
                        className='w-full bg-[#0b1627]/90 backdrop-blur-sm border border-white/[0.14] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-white/32 focus:outline-none focus:border-primary/55 focus:shadow-[0_0_28px_rgba(44,225,196,0.16)] transition-all duration-300'
                        disabled={isLoading || !canChat}
                    />
                </div>

                <Button
                    onClick={onSendMessage}
                    disabled={isLoading || !canChat}
                    className='mono-btn-solid rounded-2xl px-5 py-3.5 h-auto cursor-pointer'
                >
                    <Send className='h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}

export default ChatInput
