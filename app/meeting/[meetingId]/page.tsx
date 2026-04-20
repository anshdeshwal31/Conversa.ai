'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMeetingDetail } from './hooks/useMeetingDetail'
import MeetingHeader from './components/MeetingHeader'
import MeetingInfo from './components/MeetingInfo'
import ActionItems from './components/action-items/ActionItems'
import TranscriptDisplay from './components/TranscriptDisplay'
import ChatSidebar from './components/ChatSidebar'
import CustomAudioPlayer from './components/AudioPlayer'
import RippleLoader from '@/components/ui/ripple-loader'

function MeetingDetail() {
    const [chatPanelWidth, setChatPanelWidth] = useState(420)
    const [isResizing, setIsResizing] = useState(false)
    const [canUseSplitChat, setCanUseSplitChat] = useState(false)
    const splitContainerRef = useRef<HTMLDivElement | null>(null)

    const {
        meetingId,
        isOwner,
        userChecked,
        chatInput,
        messages,
        showSuggestions,
        activeTab,
        setActiveTab,
        meetingData,
        loading,
        handleSendMessage,
        handleSuggestionClick,
        handleInputChange,
        deleteActionItem,
        addActionItem,
        displayActionItems,
        meetingInfoData
    } = useMeetingDetail()

    const showResizableChat = userChecked && isOwner && canUseSplitChat

    useEffect(() => {
        const handleViewport = () => {
            setCanUseSplitChat(window.innerWidth >= 1100)
        }

        handleViewport()
        window.addEventListener('resize', handleViewport)

        return () => window.removeEventListener('resize', handleViewport)
    }, [])

    useEffect(() => {
        if (!isResizing) {
            return
        }

        const handleMouseMove = (event: MouseEvent) => {
            const container = splitContainerRef.current
            if (!container) {
                return
            }

            const rect = container.getBoundingClientRect()
            const minWidth = rect.width < 1400 ? 300 : 340
            const maxWidth = Math.max(minWidth, Math.min(760, rect.width - 340))
            const nextWidth = rect.right - event.clientX
            const clampedWidth = Math.min(maxWidth, Math.max(minWidth, nextWidth))
            setChatPanelWidth(clampedWidth)
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])

    return (
        <div className='min-h-screen'>

            <MeetingHeader
                title={meetingData?.title || 'Meeting'}
                meetingId={meetingId}
                summary={meetingData?.summary}
                actionItems={meetingData?.actionItems?.map(item => `• ${item.text}`).join('\n') || ''}
                isOwner={isOwner}
                isLoading={!userChecked}
            />
            <div ref={splitContainerRef} className={`surface-frame flex ${showResizableChat ? 'h-[calc(100vh-73px)] overflow-hidden' : 'min-h-[calc(100vh-73px)] flex-col'} xl:flex-row`}>
                <div className={`flex-1 p-4 md:p-6 ${showResizableChat ? 'overflow-auto' : 'overflow-visible'} pb-24 ambient-panel ${!userChecked
                    ? ''
                    : !isOwner
                        ? 'max-w-4xl mx-auto'
                        : ''
                    }`}>
                    <MeetingInfo meetingData={meetingInfoData} />

                    <div className='mb-8'>
                        <div className='flex border-b border-white/[0.1]'>
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer
                                ${activeTab === 'summary'
                                    ? 'border-primary text-primary'
                                        : 'border-transparent text-white/45 hover:text-white/75'
                                    }`}
                                type='button'
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer
                                ${activeTab === 'transcript'
                                    ? 'border-primary text-primary'
                                        : 'border-transparent text-white/45 hover:text-white/75'
                                    }`}
                                type='button'
                            >
                                Transcript
                            </button>
                        </div>

                        <div className='mt-6'>
                            {activeTab === 'summary' && (
                                <div>
                                    {loading ? (
                                        <div className='glass-card p-6 text-center'>
                                            <RippleLoader size={30} className='mx-auto mb-4' />
                                            <p className='text-gray-400'>Loading meeting data..</p>
                                        </div>
                                    ) : meetingData?.processed ? (
                                        <div className='space-y-6'>
                                            {meetingData.summary && (
                                                <div className='glass-card p-6'>
                                                    <h3 className='text-lg font-semibold text-white mb-3'>Meeting Summary</h3>
                                                    <p className='text-gray-400 leading-relaxed'>
                                                        {meetingData.summary}
                                                    </p>
                                                </div>
                                            )}

                                            {!userChecked ? (
                                                <div className='glass-card p-6'>
                                                    <div className='animate-pulse'>
                                                        <div className='h-4 bg-white/[0.06] rounded w-1/4 mb-4'></div>
                                                        <div className='space-y-2'>
                                                            <div className='h-3 bg-white/[0.06] rounded w-3/4'></div>
                                                            <div className='h-3 bg-white/[0.06] rounded w-1/2'></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {isOwner && displayActionItems.length > 0 && (
                                                        <ActionItems
                                                            actionItems={displayActionItems}
                                                            onDeleteItem={deleteActionItem}
                                                            onAddItem={addActionItem}
                                                            meetingId={meetingId}
                                                        />
                                                    )}

                                                    {!isOwner && displayActionItems.length > 0 && (
                                                        <div className='glass-card p-6'>
                                                            <h3 className='text-lg font-semibold text-white mb-4'>
                                                                Action Items
                                                            </h3>
                                                            <div className='space-y-3'>
                                                                {displayActionItems.map((item) => (
                                                                    <div key={item.id} className='flex items-start gap-3'>
                                                                        <div className='w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0'></div>
                                                                        <p className='text-sm text-gray-300'>{item.text}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='glass-card p-6 text-center'>
                                            <RippleLoader size={30} className='mx-auto mb-4' />
                                            <p className='text-gray-400'>Processing meeting with AI..</p>
                                            <p className='text-sm text-gray-500 mt-2'>You&apos;ll receive an email when ready</p>

                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'transcript' && (
                                <div>
                                    {loading ? (
                                        <div className='glass-card p-6 text-center'>
                                            <RippleLoader size={30} className='mx-auto mb-4' />
                                            <p className='text-gray-400'>Loading meeting data..</p>
                                        </div>
                                    ) : meetingData?.transcript ? (
                                        <TranscriptDisplay transcript={meetingData.transcript} />
                                    ) : (
                                        <div className='glass-card p-6 text-center'>
                                            <p className='text-gray-400'>No transcript available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                    </div>

                    {userChecked && isOwner && !canUseSplitChat && (
                        <div className='mt-6 h-[420px] rounded-2xl border border-white/[0.08] overflow-hidden'>
                            <ChatSidebar
                                messages={messages}
                                chatInput={chatInput}
                                showSuggestions={showSuggestions}
                                onInputChange={handleInputChange}
                                onSendMessage={handleSendMessage}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        </div>
                    )}

                </div>

                {!userChecked ? (
                    <div className='w-full xl:w-[360px] border-l border-white/[0.08] p-4 bg-[#0F0F15]'>
                        <div className='animate-pulse'>
                            <div className='h-4 bg-white/[0.06] rounded w-1/2 mb-4'></div>
                            <div className='space-y-3'>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                            </div>
                        </div>
                    </div>
                ) : showResizableChat ? (
                    <>
                        <div
                            onMouseDown={() => setIsResizing(true)}
                            className={`relative w-2 cursor-col-resize border-l border-r border-white/[0.08] transition-colors ${isResizing ? 'bg-sky-400/30' : 'bg-white/[0.02] hover:bg-white/[0.12]'}`}
                            role='separator'
                            aria-orientation='vertical'
                            aria-label='Resize chat panel'
                        >
                            <div className='absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/35' />
                        </div>

                        <div className='shrink-0 h-full min-w-0' style={{ width: `${chatPanelWidth}px` }}>
                            <ChatSidebar
                                messages={messages}
                                chatInput={chatInput}
                                showSuggestions={showSuggestions}
                                onInputChange={handleInputChange}
                                onSendMessage={handleSendMessage}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        </div>
                    </>
                ) : null}

            </div>

            <CustomAudioPlayer
                recordingUrl={meetingData?.recordingUrl}
                isOwner={isOwner}
            />
        </div>
    )
}

export default MeetingDetail
