'use client'

interface TranscriptWord {
    word: string
    start: number
    end: number
}

interface TranscriptSegment {
    words: TranscriptWord[]
    offset: number
    speaker: string
}

interface TranscriptDisplayProps {
    transcript: TranscriptSegment[]
}

export default function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)

        return `${minutes}:${secs.toString().padStart(2, '0')}`

    }

    const getSpeakerSegmentTime = (segment: TranscriptSegment) => {
        const startTime = segment.offset
        const endTime = segment.words[segment.words.length - 1]?.end || segment.offset

        return `${formatTime(startTime)} - ${formatTime(endTime)}`
    }

    const getSegmentText = (segment: TranscriptSegment) => {
        return segment.words.map(word => word.word).join(' ')
    }

    if (!transcript || transcript.length === 0) {
        return (
            <div className='glass-card p-6 text-center'>
                <p className='text-gray-400'>
                    No transcript available
                </p>
            </div>
        )
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
                Meeting transcript
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                {transcript.map((segment, index) => (
                    <div key={index} className="pb-4 border-b border-white/[0.06] last:border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-white">
                                {segment.speaker}
                            </span>
                            <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-1 rounded">
                                {getSpeakerSegmentTime(segment)}
                            </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed pl-4">
                            {getSegmentText(segment)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}