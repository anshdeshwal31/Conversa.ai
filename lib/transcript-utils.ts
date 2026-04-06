export interface TranscriptWord {
    word: string
    start: number
    end: number
}

export interface TranscriptSegment {
    words?: TranscriptWord[]
    offset: number
    speaker: string
    text?: string
    start?: number
    end?: number
}

function toFiniteNumber(value: unknown, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return fallback
}

function wordsToText(words: TranscriptWord[] | undefined) {
    if (!Array.isArray(words) || words.length === 0) {
        return ''
    }

    return words.map(word => word.word).join(' ').trim()
}

function segmentFromLine(line: string): TranscriptSegment | null {
    const trimmed = line.trim()
    if (!trimmed) {
        return null
    }

    const match = trimmed.match(/^([^:]{1,80}):\s*(.+)$/)
    const speaker = match?.[1]?.trim() || 'Speaker'
    const text = match?.[2]?.trim() || trimmed

    if (!text) {
        return null
    }

    return {
        words: [],
        offset: 0,
        speaker,
        text,
        start: 0,
        end: 0
    }
}

function segmentFromItem(item: any): TranscriptSegment | null {
    if (typeof item === 'string') {
        return segmentFromLine(item)
    }

    if (!item || typeof item !== 'object') {
        return null
    }

    const speaker =
        (typeof item.speaker === 'string' && item.speaker.trim()) ||
        (typeof item.speaker_name === 'string' && item.speaker_name.trim()) ||
        (typeof item.speakerName === 'string' && item.speakerName.trim()) ||
        'Speaker'

    const normalizedWords = Array.isArray(item.words)
        ? item.words
            .map((wordItem: any) => {
                const word = typeof wordItem?.word === 'string' ? wordItem.word.trim() : ''
                if (!word) {
                    return null
                }

                const start = toFiniteNumber(wordItem?.start)
                const end = toFiniteNumber(wordItem?.end, start)

                return {
                    word,
                    start,
                    end
                }
            })
            .filter(Boolean) as TranscriptWord[]
        : []

    const start = toFiniteNumber(item?.start, toFiniteNumber(item?.offset))
    const end = toFiniteNumber(item?.end, normalizedWords[normalizedWords.length - 1]?.end ?? start)
    const explicitText =
        (typeof item?.text === 'string' && item.text.trim()) ||
        (typeof item?.transcript === 'string' && item.transcript.trim()) ||
        ''

    const text = explicitText || wordsToText(normalizedWords)

    if (!text) {
        return null
    }

    const offset = toFiniteNumber(item?.offset, start)

    return {
        words: normalizedWords,
        offset,
        speaker,
        text,
        start,
        end
    }
}

export function normalizeTranscriptSegments(transcript: any): TranscriptSegment[] {
    if (!transcript) {
        return []
    }

    if (Array.isArray(transcript)) {
        return transcript
            .map(segmentFromItem)
            .filter(Boolean) as TranscriptSegment[]
    }

    if (typeof transcript === 'string') {
        return transcript
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(segmentFromLine)
            .filter(Boolean) as TranscriptSegment[]
    }

    if (Array.isArray(transcript?.result?.utterances)) {
        return normalizeTranscriptSegments(transcript.result.utterances)
    }

    if (Array.isArray(transcript?.utterances)) {
        return normalizeTranscriptSegments(transcript.utterances)
    }

    if (Array.isArray(transcript?.transcript)) {
        return normalizeTranscriptSegments(transcript.transcript)
    }

    if (Array.isArray(transcript?.transcriptions)) {
        const chunkUtterances = transcript.transcriptions.flatMap((chunk: any) => {
            if (Array.isArray(chunk?.transcription?.utterances)) {
                return chunk.transcription.utterances
            }

            if (Array.isArray(chunk?.utterances)) {
                return chunk.utterances
            }

            return []
        })

        if (chunkUtterances.length > 0) {
            return normalizeTranscriptSegments(chunkUtterances)
        }
    }

    if (typeof transcript?.text === 'string') {
        return normalizeTranscriptSegments(transcript.text)
    }

    if (typeof transcript?.full_transcript === 'string') {
        return normalizeTranscriptSegments(transcript.full_transcript)
    }

    if (typeof transcript?.result?.text === 'string') {
        return normalizeTranscriptSegments(transcript.result.text)
    }

    return []
}

export function transcriptToText(transcript: any) {
    const normalizedSegments = normalizeTranscriptSegments(transcript)

    if (normalizedSegments.length > 0) {
        return normalizedSegments
            .map(segment => {
                const text =
                    (typeof segment.text === 'string' && segment.text.trim()) ||
                    wordsToText(segment.words)

                if (!text) {
                    return ''
                }

                return `${segment.speaker || 'Speaker'}: ${text}`
            })
            .filter(Boolean)
            .join('\n')
    }

    if (typeof transcript === 'string') {
        return transcript
    }

    if (typeof transcript?.text === 'string') {
        return transcript.text
    }

    if (typeof transcript?.full_transcript === 'string') {
        return transcript.full_transcript
    }

    if (typeof transcript?.result?.text === 'string') {
        return transcript.result.text
    }

    return ''
}