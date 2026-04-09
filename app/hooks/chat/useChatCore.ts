import { useUsage } from "@/app/contexts/UsageContext"
import { useAuth } from "@clerk/nextjs"
import { useState } from "react"

export interface ChatMessage {
    id: number
    content: string
    isBot: boolean
    timestamp: Date
}

interface UseChatCoreOptions {
    apiEndpoint: string
    getRequestBody: (input: string) => any
}

function formatAssistantMessage(content: string) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*-\s+/gm, '• ')
        .replace(/\r/g, '')
        .replace(/\s\*\s+(?=[A-Za-z0-9])/g, '\n• ')
        .replace(/^\*\s+/gm, '• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

function getChunkSize(totalLength: number) {
    if (totalLength > 1200) return 20
    if (totalLength > 800) return 14
    if (totalLength > 450) return 10
    return 6
}

function getChunkDelay(lastChar: string, totalLength: number) {
    if (lastChar === '\n') return 26
    if (/[.!?]/.test(lastChar)) return 24
    if (totalLength > 1200) return 6
    if (totalLength > 800) return 8
    return 12
}

export function useChatCore({
    apiEndpoint,
    getRequestBody,
}: UseChatCoreOptions) {
    const [chatInput, setChatInput] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [showSuggestions, setShowSuggestions] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const { canChat, loading: usageLoading, incrementChatUsage } = useUsage()
    const { userId } = useAuth()

    const createMessageId = () => Date.now() + Math.floor(Math.random() * 1000)

    const pushAssistantMessage = async (content: string) => {
        const formattedContent = formatAssistantMessage(content || 'No answer generated.')
        const messageId = createMessageId()

        setMessages(prev => [
            ...prev,
            {
                id: messageId,
                content: '',
                isBot: true,
                timestamp: new Date()
            }
        ])

        if (!formattedContent) {
            return
        }

        const totalLength = formattedContent.length
        const chunkSize = getChunkSize(totalLength)
        let cursor = 0

        while (cursor < totalLength) {
            cursor = Math.min(totalLength, cursor + chunkSize)
            const nextText = formattedContent.slice(0, cursor)

            setMessages(prev => prev.map(message => (
                message.id === messageId
                    ? { ...message, content: nextText }
                    : message
            )))

            if (cursor < totalLength) {
                const lastChar = formattedContent[cursor - 1] || ''
                const delay = getChunkDelay(lastChar, totalLength)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    const handleSendMessage = async () => {
        const currentInput = chatInput.trim()

        if (!currentInput || isLoading) {
            return
        }

        setShowSuggestions(false)

        const newMessage: ChatMessage = {
            id: createMessageId(),
            content: currentInput,
            isBot: false,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])

        setChatInput('')

        if (!userId) {
            await pushAssistantMessage(
                'Sign in to unlock Cross-Meeting AI. Once logged in, you can search all your meetings, pull decisions, and generate action-ready follow-ups.'
            )
            return
        }

        if (!usageLoading && !canChat) {
            await pushAssistantMessage('You have reached today\'s chat limit. Visit the Pricing page for plan details. Starter is free, and Pro/Premium are coming soon.')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(getRequestBody(currentInput))
            })

            const data = await response.json()

            if (response.ok) {
                await incrementChatUsage()

                await pushAssistantMessage(data.answer || data.response || 'No answer generated.')
            } else {
                const rawError = String(data?.error || '')
                const authError = /not logged in|not authenticated|unauthorized/i.test(rawError)

                if (data.upgradeRequired) {
                    await pushAssistantMessage(`${data.error} Visit the Pricing page for plan details. Starter is free, and Pro/Premium are coming soon.`)
                } else {
                    await pushAssistantMessage(
                        authError
                            ? 'Please sign in to continue with Cross-Meeting AI. After login, you can ask about deadlines, decisions, participants, and action items instantly.'
                            : data.error || 'Sorry, I encountered an error. Please try again.'
                    )
                }
            }

        } catch (error) {
            console.error('chat error:', error)
            await pushAssistantMessage('Sorry, I could not connect to the server. please check your connection and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setChatInput(suggestion)
    }

    const handleInputChange = (value: string) => {
        setChatInput(value)
    }

    return {
        chatInput,
        setChatInput,
        messages,
        setMessages,
        showSuggestions,
        setShowSuggestions,
        isLoading,
        setIsLoading,
        handleSendMessage,
        handleSuggestionClick,
        handleInputChange,
        canChat
    }
}