import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
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
        'gemini-embedding-001',
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

function getTargetEmbeddingDimension() {
    const configured = process.env.PINECONE_VECTOR_DIMENSION || process.env.EMBEDDING_DIMENSION
    const parsed = configured ? Number(configured) : NaN

    if (Number.isFinite(parsed) && parsed > 0) {
        return Math.floor(parsed)
    }

    return 768
}

function toFiniteNumberArray(value: unknown): number[] | null {
    if (Array.isArray(value)) {
        const arr = value.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
        return arr.length > 0 ? arr : null
    }

    if (ArrayBuffer.isView(value)) {
        const arr = Array.from(value as unknown as ArrayLike<number>).filter(item => Number.isFinite(item))
        return arr.length > 0 ? arr : null
    }

    if (value && typeof value === 'object') {
        const values = (value as { values?: unknown }).values
        if (values) {
            return toFiniteNumberArray(values)
        }
    }

    return null
}

function foldVectorToDimension(vector: number[], targetDimension: number) {
    if (vector.length === targetDimension) {
        return vector
    }

    const folded = new Array(targetDimension).fill(0)

    for (let i = 0; i < vector.length; i++) {
        folded[i % targetDimension] += vector[i]
    }

    return folded
}

function normalizeVector(vector: number[]) {
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
    if (!Number.isFinite(norm) || norm === 0) {
        return vector
    }

    return vector.map(value => value / norm)
}

function toEmbeddingVector(value: unknown, targetDimension: number) {
    const numeric = toFiniteNumberArray(value)
    if (!numeric || numeric.length === 0) {
        return null
    }

    const folded = foldVectorToDimension(numeric, targetDimension)
    const normalized = normalizeVector(folded)

    return isValidEmbeddingVector(normalized) ? normalized : null
}

function createDeterministicEmbedding(text: string, targetDimension: number) {
    const vector = new Array(targetDimension).fill(0)
    const normalizedText = text.toLowerCase().trim()

    if (!normalizedText) {
        vector[0] = 1
        return vector
    }

    const tokens = normalizedText.split(/\s+/).filter(Boolean)

    for (const token of tokens) {
        let hash = 2166136261

        for (let i = 0; i < token.length; i++) {
            hash ^= token.charCodeAt(i)
            hash = Math.imul(hash, 16777619)
        }

        const index = Math.abs(hash) % targetDimension
        const sign = (hash & 1) === 0 ? 1 : -1
        vector[index] += sign
    }

    return normalizeVector(vector)
}

function createChatModel(temperature: number, maxOutputTokens: number) {
    return new ChatGoogleGenerativeAI({
        apiKey: getGeminiApiKey(),
        model: 'gemini-2.5-flash',
        temperature,
        maxOutputTokens
    })
}

function getChatMaxOutputTokens() {
    const configured = process.env.GEMINI_CHAT_MAX_OUTPUT_TOKENS
    const parsed = configured ? Number(configured) : NaN

    if (Number.isFinite(parsed) && parsed >= 300) {
        return Math.floor(parsed)
    }

    return 1200
}

function responseHitTokenLimit(response: unknown) {
    const metadata = (response as { response_metadata?: { finishReason?: string; finish_reason?: string } })?.response_metadata
    const reason = String(metadata?.finishReason || metadata?.finish_reason || '').toUpperCase()

    return reason.includes('MAX_TOKENS') || reason.includes('LENGTH')
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
    const targetDimension = getTargetEmbeddingDimension()

    for (const model of candidates) {
        try {
            const vector = await createEmbeddingsModel(model).embedQuery(text)
            const normalizedVector = toEmbeddingVector(vector, targetDimension)

            if (normalizedVector) {
                return normalizedVector
            }

            failures.push(`${model}: returned empty/invalid vector`)
        } catch (error) {
            failures.push(`${model}: ${(error as Error)?.message || 'unknown embedding error'}`)
        }
    }

    console.warn(`createEmbedding fallback activated. Tried models: ${failures.join(' | ')}`)
    return createDeterministicEmbedding(text, targetDimension)
}

export async function createManyEmbeddings(texts: string[]) {
    const candidates = getEmbeddingModelCandidates()
    const failures: string[] = []
    const targetDimension = getTargetEmbeddingDimension()

    for (const model of candidates) {
        try {
            const vectors = await createEmbeddingsModel(model).embedDocuments(texts)
            const normalizedVectors = Array.isArray(vectors)
                ? vectors.map(vector => toEmbeddingVector(vector, targetDimension))
                : []

            const allValid =
                normalizedVectors.length === texts.length &&
                normalizedVectors.every((vector): vector is number[] => Boolean(vector))

            if (allValid) {
                return normalizedVectors
            }

            failures.push(`${model}: returned incomplete/invalid batch embeddings`)
        } catch (error) {
            failures.push(`${model}: ${(error as Error)?.message || 'unknown embedding error'}`)
        }
    }

    console.warn(`createManyEmbeddings fallback activated. Tried models: ${failures.join(' | ')}`)
    return texts.map(text => createDeterministicEmbedding(text, targetDimension))
}

export async function chatWithAI(systemPrompt: string, userQuestion: string) {
    const model = createChatModel(0.7, getChatMaxOutputTokens())

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ])

    let answer = getMessageText(response.content) || 'sorry, I could not generate a response.'

    if (responseHitTokenLimit(response) && answer.trim()) {
        const continuationResponse = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userQuestion),
            new AIMessage(answer),
            new HumanMessage('Continue from where you left off without repeating previous lines. Keep the same format.')
        ])

        const continuation = getMessageText(continuationResponse.content).trim()

        if (continuation) {
            answer = `${answer.trimEnd()}\n${continuation}`
        }
    }

    return answer
}
