'use client'

import React from 'react'
import { useMeetingDetail } from './hooks/useMeetingDetail'
import MeetingHeader from './components/MeetingHeader'
import MeetingInfo from './components/MeetingInfo'
import ActionItems from './components/action-items/ActionItems'
import TranscriptDisplay from './components/TranscriptDisplay'
import ChatSidebar from './components/ChatSidebar'
import CustomAudioPlayer from './components/AudioPlayer'

function MeetingDetail() {

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
            <div className='surface-frame flex h-[calc(100vh-73px)] overflow-hidden'>
                <div className={`flex-1 p-6 overflow-auto pb-24 ambient-panel ${!userChecked
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
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
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
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
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
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
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

                </div>

                {!userChecked ? (
                    <div className='w-90 border-l border-white/[0.08] p-4 bg-[#0F0F15]'>
                        <div className='animate-pulse'>
                            <div className='h-4 bg-white/[0.06] rounded w-1/2 mb-4'></div>
                            <div className='space-y-3'>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                                <div className='h-8 bg-white/[0.06] rounded'></div>
                            </div>
                        </div>
                    </div>
                ) : isOwner && (
                    <ChatSidebar
                        messages={messages}
                        chatInput={chatInput}
                        showSuggestions={showSuggestions}
                        onInputChange={handleInputChange}
                        onSendMessage={handleSendMessage}
                        onSuggestionClick={handleSuggestionClick}
                    />
                )}

            </div>

            <CustomAudioPlayer
                recordingUrl={meetingData?.recordingUrl}
                isOwner={isOwner}
            />
        </div>
    )
}

export default MeetingDetail
