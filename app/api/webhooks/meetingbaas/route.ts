import { processMeetingTranscript } from "@/lib/meeting-ai-processor";
import { prisma } from "@/lib/db";
import { sendMeetingSummaryEmail } from "@/lib/email-service-free";
import { processTranscript } from "@/lib/rag";
import { normalizeTranscriptSegments, transcriptToText } from "@/lib/transcript-utils";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

async function resolveTranscriptPayload(rawTranscript: any) {
    if (!rawTranscript) return null

    if (typeof rawTranscript === 'string' && /^https?:\/\//i.test(rawTranscript)) {
        try {
            const response = await fetch(rawTranscript)
            if (!response.ok) {
                return null
            }

            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
                return await response.json()
            }

            return await response.text()
        } catch {
            return null
        }
    }

    return rawTranscript
}

function pickFirstString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim()
        }
    }

    return null
}

function getMeetingBaasApiKey() {
    return process.env.MEETING_BAAS_API_KEY || process.env.MEETINGBAAS_API_KEY || ''
}

function getWebhookBotId(webhook: any) {
    return pickFirstString(
        webhook?.data?.bot_id,
        webhook?.data?.botId,
        webhook?.bot_id,
        webhook?.botId
    )
}

function getWebhookMeetingId(webhook: any) {
    return pickFirstString(
        webhook?.data?.extra?.meeting_id,
        webhook?.data?.extra?.meetingId,
        webhook?.extra?.meeting_id,
        webhook?.extra?.meetingId
    )
}

async function fetchBotDetails(botId: string) {
    const apiKey = getMeetingBaasApiKey()
    if (!apiKey) {
        console.error('meeting baas api key missing in webhook handler')
        return null
    }

    try {
        const response = await fetch(`https://api.meetingbaas.com/v2/bots/${encodeURIComponent(botId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-meeting-baas-api-key': apiKey
            }
        })

        if (!response.ok) {
            console.error(`failed to fetch bot details from meeting baas v2 (${response.status}) for bot: ${botId}`)
            return null
        }

        const payload = await response.json()
        return payload?.data || null
    } catch (error) {
        console.error('error fetching meeting baas bot details:', error)
        return null
    }
}

function hasTranscriptContent(normalizedTranscript: any[], transcriptText: string) {
    return normalizedTranscript.length > 0 || transcriptText.trim().length > 0
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text()
        const headers = {
            "svix-id": request.headers.get("svix-id") || "",
            "svix-timestamp": request.headers.get("svix-timestamp") || "",
            "svix-signature": request.headers.get("svix-signature") || "",
        }

        const webhookSecret = process.env.MEETINGBAAS_WEBHOOK_SECRET || process.env.MEETING_BAAS_WEBHOOK_SECRET
        if (webhookSecret) {
            const wh = new Webhook(webhookSecret)
            try {
                wh.verify(payload, headers)
            } catch {
                return NextResponse.json({ error: "Invalid Signature" }, { status: 400 })
            }
        }

        const webhook = JSON.parse(payload)
        const webhookData = webhook?.data || {}
        const webhookEvent = webhook?.event
        const botId = getWebhookBotId(webhook)
        const webhookMeetingId = getWebhookMeetingId(webhook)

        if (webhookEvent === 'bot.completed' || webhookEvent === 'complete') {
            if (!botId && !webhookMeetingId) {
                console.error('bot.completed webhook missing both bot id and meeting id')
                return NextResponse.json({ error: 'bot id and meeting id missing in webhook payload' }, { status: 400 })
            }

            const botDetails = botId ? await fetchBotDetails(botId) : null
            const artifactSource = botDetails || webhookData
            const resolvedMeetingId = pickFirstString(
                botDetails?.extra?.meeting_id,
                botDetails?.extra?.meetingId,
                webhookMeetingId
            )

            const transcriptionSource =
                artifactSource?.transcription ||
                webhookData?.transcription ||
                artifactSource?.transcript ||
                webhookData?.transcript ||
                null

            const rawTranscriptionSource =
                artifactSource?.raw_transcription ||
                webhookData?.raw_transcription ||
                null

            let transcriptPayload = await resolveTranscriptPayload(transcriptionSource)

            if (!transcriptPayload && rawTranscriptionSource) {
                transcriptPayload = await resolveTranscriptPayload(rawTranscriptionSource)
            }

            const normalizedTranscript = normalizeTranscriptSegments(transcriptPayload)
            const transcriptForStorage = normalizedTranscript.length > 0 ? normalizedTranscript : transcriptPayload
            const transcriptText = transcriptToText(transcriptForStorage)
            const transcriptReady = hasTranscriptContent(normalizedTranscript, transcriptText)

            const recordingUrl = pickFirstString(
                artifactSource?.video,
                webhookData?.video,
                artifactSource?.mp4,
                webhookData?.mp4
            )

            const speakers =
                artifactSource?.speakers ||
                webhookData?.speakers ||
                artifactSource?.participants ||
                webhookData?.participants ||
                null

            let meeting = null

            if (resolvedMeetingId) {
                meeting = await prisma.meeting.findUnique({
                    where: {
                        id: resolvedMeetingId
                    },
                    include: {
                        user: true
                    }
                })
            }

            if (!meeting && botId) {
                meeting = await prisma.meeting.findFirst({
                    where: {
                        botId: botId
                    },
                    include: {
                        user: true
                    }
                })
            }

            if (!meeting) {
                console.error('meeting not found for webhook event', { botId, meetingId: resolvedMeetingId })
                return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
            }

            if (botId && meeting.botId !== botId) {
                await prisma.meeting.update({
                    where: {
                        id: meeting.id
                    },
                    data: {
                        botId: botId
                    }
                })
            }

            if (!meeting.user.email) {
                console.error('user email not found for this meeting', meeting.id)
                return NextResponse.json({ error: 'user email not found' }, { status: 400 })
            }

            await prisma.meeting.update({
                where: {
                    id: meeting.id
                },
                data: {
                    meetingEnded: true,
                    transcriptReady: transcriptReady,
                    transcript: transcriptForStorage || null,
                    recordingUrl: recordingUrl || null,
                    speakers: speakers
                }
            })

            if (transcriptReady && !meeting.processed) {
                try {
                    const processed = await processMeetingTranscript(transcriptForStorage)

                    try {
                        await sendMeetingSummaryEmail({
                            userEmail: meeting.user.email,
                            userName: meeting.user.name || 'User',
                            meetingTitle: meeting.title,
                            summary: processed.summary,
                            actionItems: processed.actionItems,
                            meetingId: meeting.id,
                            meetingDate: meeting.startTime.toLocaleDateString()
                        })

                        await prisma.meeting.update({
                            where: {
                                id: meeting.id
                            },
                            data: {
                                emailSent: true,
                                emailSentAt: new Date()
                            }
                        })
                    } catch (emailError) {
                        console.error('failed to send the email:', emailError)
                    }

                    let ragProcessed = false
                    let ragProcessedAt: Date | null = null

                    if (transcriptText) {
                        try {
                            await processTranscript(meeting.id, meeting.userId, transcriptText, meeting.title)
                            ragProcessed = true
                            ragProcessedAt = new Date()
                        } catch (ragError) {
                            console.error('failed to process transcript for rag indexing:', ragError)
                        }
                    }

                    await prisma.meeting.update({
                        where: {
                            id: meeting.id
                        },
                        data: {
                            summary: processed.summary,
                            actionItems: processed.actionItems,
                            processed: true,
                            processedAt: new Date(),
                            ragProcessed: ragProcessed,
                            ragProcessedAt: ragProcessedAt
                        }
                    })


                } catch (processingError) {
                    console.error('failed to process the transcript:', processingError)

                    await prisma.meeting.update({
                        where: {
                            id: meeting.id
                        },
                        data: {
                            processed: true,
                            processedAt: new Date(),
                            summary: 'processing failed. please check the transcript manually.',
                            actionItems: []
                        }
                    })
                }
            }

            return NextResponse.json({
                success: true,
                message: 'meeting processed succesfully',
                meetingId: meeting.id
            })
        }

        if (webhookEvent === 'bot.failed' || webhookEvent === 'failed') {
            if (!botId && !webhookMeetingId) {
                return NextResponse.json({ success: true, message: 'bot.failed webhook recieved without bot id or meeting id' })
            }

            let meeting = null

            if (webhookMeetingId) {
                meeting = await prisma.meeting.findUnique({
                    where: {
                        id: webhookMeetingId
                    }
                })
            }

            if (!meeting && botId) {
                meeting = await prisma.meeting.findFirst({
                    where: {
                        botId: botId
                    }
                })
            }

            if (!meeting) {
                return NextResponse.json({
                    success: true,
                    message: 'bot.failed webhook recieved for unknown meeting',
                    botId,
                    meetingId: webhookMeetingId
                })
            }

            if (botId && meeting.botId !== botId) {
                await prisma.meeting.update({
                    where: {
                        id: meeting.id
                    },
                    data: {
                        botId: botId
                    }
                })
            }

            if (!meeting.processed) {
                const failureReason =
                    pickFirstString(webhookData?.error_message, webhookData?.error, webhookData?.status?.error_message) ||
                    'Meeting bot failed before transcript was generated.'

                await prisma.meeting.update({
                    where: {
                        id: meeting.id
                    },
                    data: {
                        meetingEnded: true,
                        transcriptReady: false,
                        processed: true,
                        processedAt: new Date(),
                        summary: failureReason,
                        actionItems: []
                    }
                })
            }

            return NextResponse.json({
                success: true,
                message: 'bot failure processed',
                meetingId: meeting.id
            })
        }

        return NextResponse.json({
            success: true,
            message: 'webhook recieved but no action needed bro'
        })
    } catch (error) {
        console.error('webhook processing errir:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}