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
                    {messages.length === 0 && showSuggestions ? (
                        <ChatSuggestions
                            suggestions={chatSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                        />
                    ) : (
                        <ChatMessages
                            messages={messages}
                            isLoading={isLoading}
                        />
                    )}

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
