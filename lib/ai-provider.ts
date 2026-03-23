import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

function getGeminiApiKey() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!key) {
        throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY) environment variable')
    }

    return key
}

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: getGeminiApiKey(),
    model: 'text-embedding-004'
})

function createChatModel(temperature: number, maxOutputTokens: number) {
    return new ChatGoogleGenerativeAI({
        apiKey: getGeminiApiKey(),
        model: 'gemini-2.5-flash',
        temperature,
        maxOutputTokens
    })
}

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

export async function createEmbedding(text: string) {
    return embeddingsModel.embedQuery(text)
}

export async function createManyEmbeddings(texts: string[]) {
    return embeddingsModel.embedDocuments(texts)
}

export async function chatWithAI(systemPrompt: string, userQuestion: string) {
    const model = createChatModel(0.7, 500)

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ])

    return getMessageText(response.content) || 'sorry, I could not generate a response.'
}
