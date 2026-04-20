'use client'

import { SignOutButton, useAuth, useUser } from '@clerk/nextjs'
import { Bot, LogOut, Save, Upload, User } from 'lucide-react'
import React, { ChangeEvent, useEffect, useState } from 'react'
import RippleLoader from '@/components/ui/ripple-loader'

function Settings() {

    const { user } = useUser()
    const { userId, isLoaded } = useAuth()
    const [botName, setBotName] = useState('Meeting Bot')
    const [botImageUrl, setBotImageUrl] = useState<string | null>(null)
    const [botImageStorageUrl, setBotImageStorageUrl] = useState<string | null>(null)
    const [userPlan, setUserPlan] = useState('free')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (!isLoaded) {
            return
        }

        if (userId) {
            fetchBotSettings()
        } else {
            setIsLoading(false)
        }
    }, [userId, isLoaded])

    const normalizeImageUrl = (value: unknown): string | null => {
        if (typeof value !== 'string') {
            return null
        }

        const normalized = value.trim()

        if (!normalized || normalized === 'undefined' || normalized === 'null') {
            return null
        }

        return normalized
    }

    const fetchBotSettings = async () => {
        try {
            const response = await fetch('/api/user/bot-settings')
            if (response.ok) {
                const data = await response.json()
                setBotName(data.botName || 'Meeting Bot')
                setBotImageUrl(normalizeImageUrl(data.botImageUrl))
                setBotImageStorageUrl(normalizeImageUrl(data.botImageStorageUrl ?? data.botImageUrl))
                setUserPlan(data.plan || 'free')
            }
        } catch (error) {
            console.error('error fetching bot settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBotNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBotName(e.target.value)
        setHasChanges(true)
    }

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch('/api/upload/bot-avatar', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                const normalizedStorageUrl = normalizeImageUrl(data.url)
                const normalizedPreviewUrl = normalizeImageUrl(data.previewUrl || data.url)

                setBotImageStorageUrl(normalizedStorageUrl)
                setBotImageUrl(normalizedPreviewUrl)
                setHasChanges(true)
            } else {
                console.error('image uploaded failed:', data.error)
            }
        } catch (error) {
            console.error('image uploaded failed:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const saveBotSettings = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/user/bot-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    botName,
                    botImageUrl: normalizeImageUrl(botImageStorageUrl ?? botImageUrl),
                    botImageStorageUrl: normalizeImageUrl(botImageStorageUrl ?? botImageUrl)
                })
            })

            if (response.ok) {
                setHasChanges(false)
                await fetchBotSettings()
            }
        } catch (error) {
            console.error('error saving bot settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const getPlanDisplayName = (plan: string) => {
        switch (plan.toLowerCase()) {
            case 'free':
            case 'starter':
                return 'Starter (Free)'
            case 'pro':
                return 'Pro Plan'
            case 'premium':
                return 'Premium Plan'
            default:
                return 'Invalid Plan'
        }
    }

    const getPlanColor = (plan: string) => {
        const normalizedPlan = plan.toLowerCase()

        return normalizedPlan === 'free' || normalizedPlan === 'starter'
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
            : 'bg-white/[0.14] text-white/85 border border-white/[0.24]'
    }

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center p-6'>
                <div className='flex flex-col items-center justify-center'>
                    <RippleLoader size={28} className='mb-4' />
                    <div className='text-gray-400'>Loading Settings...</div>
                </div>
            </div>
        )
    }


    return (
        <div className='min-h-screen'>
            <div className='surface-frame max-w-3xl mx-auto p-6 md:p-8 ambient-panel'>
                <div className='text-center mb-8'>
                    <span className='section-kicker'>Profile & Bot</span>
                    <h1 className='text-2xl md:text-3xl font-semibold text-white mt-4'>Settings</h1>
                </div>

                {/* Profile Card */}
                <div className='glass-card p-6 mb-8'>
                    <div className='relative'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-16 h-16 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white/25'>
                                {user?.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt="profile"
                                        className='w-16 h-16 rounded-full object-cover'
                                    />
                                ) : (
                                    <div className='w-16 h-16 bg-white/[0.08] rounded-full flex items-center justify-center'>
                                        <User className='h-8 w-8 text-white/80' />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className='text-lg font-semibold text-white'>
                                    {user?.fullName || 'User'}
                                </h2>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${getPlanColor(userPlan)}`}>
                                    {getPlanDisplayName(userPlan)}
                                </span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span className='text-[10px] uppercase tracking-wider text-gray-500 font-medium bg-white/[0.06] px-2 py-0.5 rounded'>
                                Email
                            </span>
                            <p className='text-sm text-gray-300'>
                                {user?.primaryEmailAddress?.emailAddress || 'No email'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bot Customization Card */}
                <div className='glass-card p-6'>
                    <h3 className='text-lg font-semibold text-white mb-6'>Bot Customization</h3>

                    <div className='mb-6'>
                        <label htmlFor='bot-name' className='block text-sm font-medium text-white/80 mb-2'>
                            Bot Name
                        </label>
                        <input
                            id='bot-name'
                            type='text'
                            value={botName}
                            onChange={handleBotNameChange}
                            placeholder='Enter Bot Name...'
                            className='w-full bg-[#0b1627]/90 border border-white/[0.14] rounded-xl px-4 py-2.5 text-white placeholder:text-white/34 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/50 transition-all'
                        />
                    </div>

                    <div className='mb-6'>
                        <label htmlFor='bot-image-upload' className='block text-sm font-medium text-white/80 mb-2'>
                            Bot Avatar
                        </label>

                        <div className='flex items-center gap-4'>
                            <div className='w-20 h-20 bg-white/[0.04] border border-white/[0.08] rounded-full flex items-center justify-center overflow-hidden'>
                                {botImageUrl ? (
                                    <img
                                        src={botImageUrl}
                                        alt='Bot Avatar'
                                        className='w-20 h-20 rounded-full object-cover'
                                        onError={() => {
                                            const fallbackUrl = normalizeImageUrl(botImageStorageUrl)

                                            if (fallbackUrl && fallbackUrl !== botImageUrl) {
                                                setBotImageUrl(fallbackUrl)
                                                return
                                            }

                                            setBotImageUrl(null)
                                        }}
                                    />
                                ) : (
                                    <Bot className='h-10 w-10 text-white/60' />
                                )}
                            </div>

                            <div>
                                <input
                                    type='file'
                                    id='bot-image-upload'
                                    accept='image/*'
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className='hidden'
                                />

                                <label
                                    htmlFor='bot-image-upload'
                                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0e1f34] border border-primary/25 text-white/80 rounded-xl hover:bg-[#122843] transition-colors cursor-pointer text-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className='h-4 w-4' />
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </label>

                                <p className='text-xs text-gray-500 mt-1'>
                                    JPG or PNG
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasChanges && (
                        <button
                            onClick={saveBotSettings}
                            disabled={isSaving}
                            className='bg-white text-black inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium mb-6 cursor-pointer hover:opacity-90 disabled:opacity-50'
                        >
                            <Save className='h-4 w-4' />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}

                    <div className='pt-5 border-t border-white/[0.06]'>
                        <SignOutButton>
                            <button
                                className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm cursor-pointer'
                            >
                                <LogOut className='h-4 w-4' />
                                Sign Out
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
