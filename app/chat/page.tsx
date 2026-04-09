'use client'

import React from 'react'
import useChatAll from './hooks/useChatAll'
import ChatSuggestions from './components/ChatSuggestions'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'

function Chat() {
    const {
        chatInput,
        messages,
        showSuggestions,
        isLoading,
        chatSuggestions,
        handleSendMessage,
        handleSuggestionClick,
        handleInputChange
    } = useChatAll()


    return (
        <div className='min-h-screen'>
            <div className='surface-frame flex flex-col max-w-[1200px] mx-auto w-full ambient-panel overflow-hidden'>
                <div className='px-6 pt-5 pb-2 border-b border-white/10'>
                    <span className='section-kicker'>Cross-Meeting AI</span>
                    <h1 className='text-2xl md:text-3xl font-semibold text-white mt-4'>Chat Across Every Meeting</h1>
                </div>

                <div className='flex-1 p-6 overflow-auto'>
                    <div
                        className={`transition-all duration-500 ease-out overflow-hidden ${
                            showSuggestions
                                ? 'max-h-[900px] opacity-100 translate-y-0 mb-6'
                                : 'max-h-0 opacity-0 -translate-y-2 mb-0 pointer-events-none'
                        }`}
                    >
                        <ChatSuggestions
                            suggestions={chatSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                        />
                    </div>

                    <div
                        className={`transition-all duration-500 ease-out ${
                            showSuggestions && messages.length === 0
                                ? 'max-h-0 opacity-0 translate-y-2 overflow-hidden pointer-events-none'
                                : 'max-h-[3000px] opacity-100 translate-y-0'
                        }`}
                    >
                        <ChatMessages
                            messages={messages}
                            isLoading={isLoading}
                        />
                    </div>

                </div>
                <ChatInput
                    chatInput={chatInput}
                    onInputChange={handleInputChange}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />

            </div>

        </div>
    )
}

export default Chat
