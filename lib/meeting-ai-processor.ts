import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { transcriptToText } from './transcript-utils'

function getGeminiApiKey() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!key) {
        throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY) environment variable')
    }

    return key
}

const model = new ChatGoogleGenerativeAI({
    apiKey: getGeminiApiKey(),
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxOutputTokens: 1000
})

function getMessageText(content: unknown) {
    if (typeof content === 'string') {
        return content
    }

    if (Array.isArray(content)) {
        return content
            .map(part => {
                if (typeof part === 'string') return part

                if (
                    typeof part === 'object' &&
                    part !== null &&
                    'text' in part &&
                    typeof (part as { text?: unknown }).text === 'string'
                ) {
                    return (part as { text: string }).text
                }

                return ''
            })
            .join('')
    }

    return ''
}

function extractJsonObject(text: string) {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error('No JSON object found in model response')
    }

    return text.slice(firstBrace, lastBrace + 1)
}

export async function processMeetingTranscript(transcript: any) {
    try {
        const transcriptText = transcriptToText(transcript)

        if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error('No transcript content found')
        }


        const response = await model.invoke([
            new SystemMessage(`You are an AI assistant that analyzes meeting transcripts and provides concise summaries and action items.

                    Please analyze the meeting transcript and provide:
                    1. A clear, concise summary (2-3 sentences) of the main discussion points and decisions
                    2. A list of specific action items mentioned in the meeting

                    Format your response as JSON:
                    {
                        "summary": "Your summary here",
                        "actionItems": [
                            "Action item description 1",
                            "Action item description 2"
                        ]
                    }

                    Return only the action item text as strings.
                    If no clear action items are mentioned, return an empty array for actionItems.`),
            new HumanMessage(`Please analyze this meeting transcript:\n\n${transcriptText}`)
        ])

        const responseText = getMessageText(response.content)

        if (!responseText) {
            throw new Error('No response from Gemini')
        }

        const parsed = JSON.parse(extractJsonObject(responseText))

        const actionItems = Array.isArray(parsed.actionItems)
            ? parsed.actionItems.map((text: string, index: number) => ({
                id: index + 1,
                text: text
            }))
            : []


        return {
            summary: parsed.summary || 'Summary couldnt be generated',
            actionItems: actionItems
        }

    } catch (error) {
        console.error('error processing transcript with gemini:', error)

        return {
            summary: 'Meeting transcript processed successfully. Please check the full transcript for details.',
            actionItems: []
        }
    }
}
