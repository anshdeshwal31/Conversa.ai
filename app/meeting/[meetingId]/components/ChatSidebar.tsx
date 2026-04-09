import { useUsage } from '@/app/contexts/UsageContext'
import { Send } from 'lucide-react'
import React from 'react'

interface Message {
    id: number
    content: string
    isBot: boolean
    timestamp: Date
}

interface ChatSidebarProps {
    messages: Message[]
    chatInput: string
    showSuggestions: boolean
    onInputChange: (value: string) => void
    onSendMessage: () => void
    onSuggestionClick: (suggestion: string) => void
}

function ChatSidebar({
    messages,
    chatInput,
    showSuggestions,
    onInputChange,
    onSendMessage,
    onSuggestionClick
}: ChatSidebarProps) {
    const { canChat, loading } = useUsage()
    const chatLocked = !loading && !canChat
    const chatSuggestions = [
        "What deadlines were discussed in this meeting?",
        "Write a follow-up email for the team",
        "What suggestions was I given during the discussion?",
        "Summarize the key action items from this meeting"
    ]
    return (
        <div className='w-full h-full border-l border-white/[0.08] bg-[#0F0F15] flex flex-col'>

            <div className='p-4 border-b border-white/[0.08]'>
                <h3 className='font-semibold text-white'>
                    Meeting Assistant
                </h3>
                <p className='text-sm text-gray-500'>
                    Ask me anything about this meeting
                </p>
            </div>

            <div className='flex-1 p-4 overflow-auto space-y-4'>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-3 ${message.isBot
                                ? 'bg-white/[0.04] border border-white/[0.08] text-gray-300'
                                : 'bg-white/[0.08] border border-white/[0.14] text-white'
                                }`}
                        >
                            <p className='text-sm whitespace-pre-wrap break-words leading-relaxed'>{message.content}</p>
                        </div>
                    </div>
                ))}

                {messages.length > 0 && !messages[messages.length - 1].isBot && (
                    <div className='flex justify-start'>
                        <div className='bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-2xl p-3'>
                            <div className='flex gap-1'>
                                <div className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]'></div>
                                <div className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]'></div>
                                <div className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]'></div>
                            </div>
                        </div>
                    </div>
                )}
                {showSuggestions && messages.length === 0 && (
                    <div className='flex flex-col items-center space-y-3 mt-8'>
                        {chatSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick(suggestion)}
                                disabled={chatLocked}
                                className={`w-4/5 rounded-xl p-4 border transition-all text-center cursor-pointer ${!chatLocked
                                    ? 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.2]'
                                    : 'bg-white/[0.02] text-gray-600 border-white/[0.04] cursor-not-allowed'
                                    }`}
                            >
                                <p className='text-sm'>⚡️ {suggestion}</p>
                            </button>
                        ))}
                    </div>
                )}

                {chatLocked && (
                    <div className='text-center p-4'>
                        <p className='text-xs text-gray-500 mb-2'>Daily chat limit reached</p>
                        <a href="/pricing" className='text-xs text-white/80 hover:underline'>
                            See pricing details (Starter is free, Pro/Premium are coming soon)
                        </a>
                    </div>
                )}
            </div>

            <div className='p-4 border-t border-white/[0.08]'>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        value={chatInput}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault()
                                onSendMessage()
                            }
                        }}
                        placeholder={!chatLocked ? "Ask about this meeting..." : "Daily limit reached — Starter is free; Pro/Premium are coming soon"}
                        className='flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/25 transition-all'
                        disabled={chatLocked}
                    />

                    <button
                        type='button'
                        onClick={onSendMessage}
                        disabled={!chatInput.trim() || chatLocked}
                        className='bg-white text-black p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90'
                    >
                        <Send className='h-4 w-4' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatSidebar
