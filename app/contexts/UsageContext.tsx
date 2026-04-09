'use client'

import { useAuth } from "@clerk/nextjs"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

interface PlanLimits {
    meetings: number
    chatMessages: number
}

interface UsageData {
    currentPlan: string
    subscriptionStatus: string
    meetingsThisMonth: number
    chatMessagesToday: number
    billingPeriodStart: string | null
}

interface UsageCachePayload {
    userId: string
    cachedAt: number
    usage: UsageData
}

interface UsageContextType {
    usage: UsageData | null
    loading: boolean
    canChat: boolean
    canScheduleMeeting: boolean
    limits: PlanLimits
    incrementChatUsage: () => Promise<void>
    incrementMeetingUsage: () => Promise<void>
    refreshUsage: () => Promise<void>
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: { meetings: 30, chatMessages: 30 },
    starter: { meetings: 50, chatMessages: 50 },
    pro: { meetings: 100, chatMessages: 100 },
    premium: { meetings: -1, chatMessages: -1 }
}

const USAGE_CACHE_KEY = 'convorbit_usage_cache_v1'
const USAGE_CACHE_TTL_MS = 1000 * 60 * 10

const UsageContext = createContext<UsageContextType | undefined>(undefined)

export function UsageProvider({ children }: { children: ReactNode }) {
    const { userId, isLoaded } = useAuth()
    const [usage, setUsage] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true)

    const readUsageCache = (targetUserId: string) => {
        if (typeof window === 'undefined') {
            return null
        }

        try {
            const raw = window.localStorage.getItem(USAGE_CACHE_KEY)
            if (!raw) {
                return null
            }

            const parsed = JSON.parse(raw) as UsageCachePayload
            const isFresh = Date.now() - parsed.cachedAt < USAGE_CACHE_TTL_MS

            if (parsed.userId !== targetUserId || !isFresh) {
                return null
            }

            return parsed.usage
        } catch {
            return null
        }
    }

    const writeUsageCache = (targetUserId: string, nextUsage: UsageData) => {
        if (typeof window === 'undefined') {
            return
        }

        const payload: UsageCachePayload = {
            userId: targetUserId,
            cachedAt: Date.now(),
            usage: nextUsage
        }

        try {
            window.localStorage.setItem(USAGE_CACHE_KEY, JSON.stringify(payload))
        } catch {
            // Ignore cache write errors.
        }
    }

    const limits = usage ? PLAN_LIMITS[usage.currentPlan] || PLAN_LIMITS.free : PLAN_LIMITS.free
    const isStarterTier = usage ? (usage.currentPlan === 'free' || usage.currentPlan === 'starter') : false
    const hasPlanAccess = usage ? (isStarterTier || usage.subscriptionStatus === 'active') : false

    const canChat = usage ? (
        hasPlanAccess &&
        (limits.chatMessages === -1 || usage.chatMessagesToday < limits.chatMessages)
    ) : false

    const canScheduleMeeting = usage ? (
        hasPlanAccess &&
        (limits.meetings === -1 || usage.meetingsThisMonth < limits.meetings)
    ) : false

    const fetchUsage = async (silent = false) => {
        if (!userId) {
            setLoading(false)
            return
        }

        if (!silent) {
            setLoading(true)
        }

        try {
            const response = await fetch('/api/user/usage')
            if (response.ok) {
                const data = await response.json()
                setUsage(data)
                writeUsageCache(userId, data)
            }
        } catch (error) {
            console.error('failed to fetch usage', error)
        } finally {
            setLoading(false)
        }
    }

    const incrementChatUsage = async () => {
        if (!loading && !canChat) {
            return
        }

        try {
            const response = await fetch('/api/user/increment-chat', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' }
            })
            if (response.ok) {
                setUsage(prev => {
                    if (!prev) {
                        return prev
                    }

                    const nextUsage = {
                        ...prev,
                        chatMessagesToday: prev.chatMessagesToday + 1
                    }

                    if (userId) {
                        writeUsageCache(userId, nextUsage)
                    }

                    return nextUsage
                })
            } else {
                const data = await response.json()
                if (data.upgradeRequired) {
                    console.log(data.error)
                    await fetchUsage(true)
                }
            }
        } catch (error) {
            console.error('failed to increment chat usage', error)
        }
    }

    const incrementMeetingUsage = async () => {
        if (!loading && !canScheduleMeeting) {
            return
        }

        try {
            const response = await fetch('/api/user/increment-meeting', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' }
            })

            if (response.ok) {
                setUsage(prev => prev ? {
                    ...prev,
                    meetingsThisMonth: prev.meetingsThisMonth + 1
                } : null)
            }
        } catch (error) {
            console.error('failed to increment meetign usage:', error)
        }
    }

    const refreshUsage = async () => {
        await fetchUsage()
    }

    useEffect(() => {
        if (isLoaded && userId) {
            const cachedUsage = readUsageCache(userId)

            if (cachedUsage) {
                setUsage(cachedUsage)
                setLoading(false)
                fetchUsage(true)
            } else {
                fetchUsage()
            }
        } else if (isLoaded && !userId) {
            setUsage(null)
            setLoading(false)
        }
    }, [userId, isLoaded])


    return (
        <UsageContext.Provider value={{
            usage,
            loading,
            canChat,
            canScheduleMeeting,
            limits,
            incrementChatUsage,
            incrementMeetingUsage,
            refreshUsage
        }}>
            {children}
        </UsageContext.Provider>
    )
}

export function useUsage() {
    const context = useContext(UsageContext)
    if (context === undefined) {
        throw new Error('useUsage must be defined')
    }

    return context
}