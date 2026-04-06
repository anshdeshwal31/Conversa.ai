import { prisma } from "./db";
import { chatWithAI, createEmbedding, createManyEmbeddings } from "./ai-provider";
import { saveManyVectors, searchVectors } from "./pinecone";
import { chunkTranscript, extractSpeaker } from "./text-chunker";

function hasEmbeddingValues(value: unknown) {
    return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'number' && Number.isFinite(item))
}

export async function processTranscript(
    meetingId: string,
    userId: string,
    transcript: string,
    meetingTitle?: string
) {
    const chunks = chunkTranscript(transcript)
        .filter(chunk => typeof chunk.content === 'string' && chunk.content.trim().length > 0)

    if (chunks.length === 0) {
        console.warn('processTranscript: no usable chunks found, skipping vector indexing', { meetingId })
        return
    }

    const texts = chunks.map(chunk => chunk.content)

    let embeddings = await createManyEmbeddings(texts)

    const hasMissingBatchEmbeddings =
        !Array.isArray(embeddings) ||
        embeddings.length !== texts.length ||
        embeddings.some(embedding => !Array.isArray(embedding) || embedding.length === 0)

    if (hasMissingBatchEmbeddings) {
        console.warn('processTranscript: falling back to one-by-one embeddings due to incomplete batch response', {
            meetingId,
            textCount: texts.length,
            embeddingCount: Array.isArray(embeddings) ? embeddings.length : 0
        })

        embeddings = await Promise.all(
            texts.map(async (text) => {
                try {
                    return await createEmbedding(text)
                } catch {
                    return []
                }
            })
        )
    }

    const dbChunks = chunks.map((chunk) => ({
        meetingId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        speakerName: extractSpeaker(chunk.content),
        vectorId: `${meetingId}_chunk_${chunk.chunkIndex}`
    }))

    await prisma.transcriptChunk.createMany({
        data: dbChunks,
        skipDuplicates: true
    })

    const vectors = chunks.map((chunk, index) => ({
        id: `${meetingId}_chunk_${chunk.chunkIndex}`,
        embedding: Array.isArray(embeddings[index]) ? embeddings[index] : [],
        metadata: {
            meetingId,
            userId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            speakerName: extractSpeaker(chunk.content),
            meetingTitle: meetingTitle || 'Untitled Meeting'

        }
    }))

    const hasAnyValidVector = vectors.some(vector => hasEmbeddingValues(vector.embedding))

    if (!hasAnyValidVector) {
        throw new Error(`processTranscript: no valid embeddings generated for meeting ${meetingId}`)
    }

    await saveManyVectors(vectors)
}

export async function chatWithMeeting(
    userId: string,
    meetingId: string,
    question: string
) {
    const questionEmbedding = await createEmbedding(question)

    const results = await searchVectors(
        questionEmbedding,
        { userId, meetingId },
        5
    )

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: meetingId
        }
    })

    const context = results
        .map(result => {
            const speaker = result.metadata?.speakerName || 'Unknown'
            const content = result.metadata?.content || ''
            return `${speaker}: ${content}`
        })
        .join('\n\n')

    const systemPrompt = `You are helping someone understand their meeting.
    Meeting: ${meeting?.title || 'Untitled Meeting'}
    Date: ${meeting?.createdAt ? new Date(meeting.createdAt).toDateString() : 'Unknown'}

    Here's what was discussed:
    ${context}

    Answer the user's question based only on the meeting content above. If the answer isn't in the meeting, say so`

    const answer = await chatWithAI(systemPrompt, question)

    return {
        answer,
        sources: results.map(result => ({
            meetingId: result.metadata?.meetingId,
            content: result.metadata?.content,
            speakerName: result.metadata?.speakerName,
            confidence: result.score
        }))
    }
}

export async function chatWithAllMeetings(
    userId: string,
    question: string
) {
    const questionEmbedding = await createEmbedding(question)

    const results = await searchVectors(
        questionEmbedding,
        { userId },
        8
    )

    const context = results
        .map(result => {
            const meetingTitle = result.metadata?.meetingTitle || 'Untitled Meeting'
            const speaker = result.metadata?.speakerName || 'Unknown'
            const content = result.metadata?.content || ''
            return `Meeting: ${meetingTitle}\n${speaker}: ${content}`
        })
        .join('\n\n---\n\n')

    const systemPrompt = `You are helping someone understand their meeting history.
    
    Here's what was discussed across their meetings:
    ${context}

    Answer the user's question based only on the meeting content above. When you reference something, mention which meetings its from.`

    const answer = await chatWithAI(systemPrompt, question)

    return {
        answer,
        sources: results.map(result => ({
            meetingId: result.metadata?.meetingId,
            meetingTitle: result.metadata?.meetingTitle,
            content: result.metadata?.content,
            speakerName: result.metadata?.speakerName,
            confidence: result.score
        }))
    }
}