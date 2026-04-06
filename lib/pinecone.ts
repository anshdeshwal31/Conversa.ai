import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

function isValidEmbedding(value: unknown) {
    return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'number' && Number.isFinite(item))
}

export async function saveManyVectors(vectors: Array<{
    id: string
    embedding: number[]
    metadata: any
}>) {
    const validVectors = vectors.filter(vector => isValidEmbedding(vector.embedding))

    if (validVectors.length === 0) {
        console.warn('saveManyVectors called with no valid embeddings, skipping Pinecone upsert')
        return
    }

    const upsertData = validVectors.map(v => ({
        id: v.id,
        values: v.embedding,
        metadata: v.metadata
    }))

    await index.upsert(upsertData)
}

export async function searchVectors(
    embedding: number[],
    filter: any = {},
    topK: number = 5
) {
    if (!isValidEmbedding(embedding)) {
        return []
    }

    const result = await index.query({
        vector: embedding,
        filter,
        topK,
        includeMetadata: true
    })

    return result.matches || []
}

