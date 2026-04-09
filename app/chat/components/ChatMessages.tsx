import { Bot, User } from 'lucide-react'
import React from 'react'

interface Message {
    id: number
    content: string
    isBot: boolean
    timestamp: Date
}

interface ChatMessagesProps {
    messages: Message[]
    isLoading: boolean
}

function ChatMessages({
    messages,
    isLoading
}: ChatMessagesProps) {
    const showTypingIndicator = isLoading && (messages.length === 0 || !messages[messages.length - 1].isBot)

    return (
        <div className='space-y-5'>
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[75%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                            message.isBot
                                ? 'bg-primary/18 border border-primary/30 text-primary'
                                : 'bg-accent/25 border border-accent/35 text-accent-foreground'
                        }`}>
                            {message.isBot ? <Bot className='w-4 h-4' /> : <User className='w-4 h-4' />}
                        </div>
                        {/* Bubble */}
                        <div className={`rounded-2xl p-4 ${
                            message.isBot
                                ? 'glass-card'
                                : 'bg-[#2b1124]/70 border border-accent/35'
                        }`}>
                            <p className='text-sm leading-relaxed text-white/86 whitespace-pre-wrap break-words'>{message.content}</p>
                        </div>
                    </div>
                </div>
            ))}

            {showTypingIndicator && (
                <div className='flex justify-start'>
                    <div className='flex gap-3'>
                        <div className='w-8 h-8 rounded-xl bg-primary/18 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1'>
                            <Bot className='w-4 h-4 text-primary' />
                        </div>
                        <div className='glass-card rounded-2xl p-4'>
                            <div className='flex items-center gap-2'>
                                <div className='flex gap-1'>
                                    <div className='w-2 h-2 bg-white/40 rounded-full animate-bounce'></div>
                                    <div className='w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]'></div>
                                    <div className='w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]'></div>
                                </div>
                                <p className='text-sm text-white/40 ml-2'>Searching through all your meetings...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ChatMessages
