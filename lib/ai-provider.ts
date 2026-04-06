import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

function getGeminiApiKey() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!key) {
        throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY) environment variable')
    }

    return key
}

function getEmbeddingModelCandidates() {
    const configuredModel = process.env.GEMINI_EMBEDDING_MODEL || process.env.GOOGLE_EMBEDDING_MODEL

    return Array.from(new Set([
        configuredModel,
        'embedding-001',
        'text-embedding-004'
    ].filter((model): model is string => Boolean(model && model.trim()))))
}

function createEmbeddingsModel(model: string) {
    return new GoogleGenerativeAIEmbeddings({
        apiKey: getGeminiApiKey(),
        model
    })
}

function isValidEmbeddingVector(value: unknown) {
    return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'number' && Number.isFinite(item))
}

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
    const candidates = getEmbeddingModelCandidates()
    const failures: string[] = []

    for (const model of candidates) {
        try {
            const vector = await createEmbeddingsModel(model).embedQuery(text)

            if (isValidEmbeddingVector(vector)) {
                return vector
            }

            failures.push(`${model}: returned empty/invalid vector`)
        } catch (error) {
            failures.push(`${model}: ${(error as Error)?.message || 'unknown embedding error'}`)
        }
    }

    throw new Error(`Unable to generate query embedding. Tried models: ${failures.join(' | ')}`)
}

export async function createManyEmbeddings(texts: string[]) {
    const candidates = getEmbeddingModelCandidates()
    const failures: string[] = []

    for (const model of candidates) {
        try {
            const vectors = await createEmbeddingsModel(model).embedDocuments(texts)

            const allValid =
                Array.isArray(vectors) &&
                vectors.length === texts.length &&
                vectors.every(vector => isValidEmbeddingVector(vector))

            if (allValid) {
                return vectors
            }

            failures.push(`${model}: returned incomplete/invalid batch embeddings`)
        } catch (error) {
            failures.push(`${model}: ${(error as Error)?.message || 'unknown embedding error'}`)
        }
    }

    throw new Error(`Unable to generate batch embeddings. Tried models: ${failures.join(' | ')}`)
}

export async function chatWithAI(systemPrompt: string, userQuestion: string) {
    const model = createChatModel(0.7, 500)

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ])

    return getMessageText(response.content) || 'sorry, I could not generate a response.'
}
