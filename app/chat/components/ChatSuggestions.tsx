import { Bot, Sparkles } from 'lucide-react'
import React from 'react'

interface ChatSuggestionsProps {
    suggestions: string[]
    onSuggestionClick: (suggestion: string) => void
}

function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
    return (
        <div className='flex flex-col items-center justify-center h-full space-y-8'>
            <div className='text-center'>
                <div className='w-16 h-16 rounded-2xl bg-primary/16 border border-primary/35 flex items-center justify-center mx-auto mb-6'>
                    <Bot className='w-8 h-8 text-primary' />
                </div>
                <h2 className='text-2xl md:text-3xl font-semibold text-white mb-3'>
                    Ask AI about your meetings
                </h2>
                <p className='text-white/50 max-w-md mx-auto'>
                    I can search across all your meetings to find information, summarize discussions, and answer questions
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl'>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className='glass-card glass-card-hover p-4 text-left group cursor-pointer rounded-2xl'
                        type='button'
                    >
                        <div className='flex items-start gap-3'>
                            <Sparkles className='w-4 h-4 text-primary/70 mt-0.5 group-hover:text-primary transition-colors flex-shrink-0' />
                            <p className='text-sm text-white/65 group-hover:text-white/88 transition-colors leading-relaxed'>
                                {suggestion}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ChatSuggestions
