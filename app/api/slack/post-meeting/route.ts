import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { WebClient } from "@slack/web-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    let dbUser = null

    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
        }

        const { meetingId, summary, actionItems } = await request.json()

        if (!meetingId) {
            return NextResponse.json({ error: 'meeting id is required' }, { status: 400 })
        }

        dbUser = await prisma.user.findFirst({
            where: {
                clerkId: user.id
            }
        })

        if (!dbUser || !dbUser.slackTeamId) {
            return NextResponse.json({ error: 'slack not connected' }, { status: 400 })
        }

        const installation = await prisma.slackInstallation.findUnique({
            where: {
                teamId: dbUser.slackTeamId
            }
        })

        if (!installation) {
            return NextResponse.json({ error: 'slack workspace not found' }, { status: 400 })
        }
        const slack = new WebClient(installation.botToken)
        let targetChannel = dbUser.preferredChannelId || ''

        if (!targetChannel) {
            const channels = await slack.conversations.list({
                types: 'public_channel',
                limit: 1
            })

            targetChannel = channels.channels?.[0]?.id || ''
        }

        if (!targetChannel) {
            return NextResponse.json({
                error: 'no slack channel available. connect slack and select a channel in integrations.'
            }, { status: 400 })
        }

        const meeting = await prisma.meeting.findUnique({
            where: {
                id: meetingId
            }
        })

        if (!meeting) {
            return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
        }

        const meetingTitle = meeting.title
        const normalizedSummary = (typeof summary === 'string' && summary.trim())
            ? summary.trim()
            : 'Meeting summary not available'

        const normalizedActionItems = Array.isArray(actionItems)
            ? actionItems
                .map((item: any) => {
                    if (typeof item === 'string') return item.trim()
                    if (item && typeof item.text === 'string') return item.text.trim()
                    return ''
                })
                .filter(Boolean)
            : typeof actionItems === 'string'
                ? actionItems.split('\n').map((item: string) => item.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean)
                : []

        const actionItemsText = normalizedActionItems.length > 0
            ? normalizedActionItems.map(item => `• ${item}`).join('\n')
            : 'No action items recorded'

        await slack.chat.postMessage({
            channel: targetChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "📝 Meeting Summary",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Meeting:*\n${meetingTitle}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Date:*\n${new Date(meeting.startTime).toLocaleString()}`
                        }
                    ]
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*📋 Summary:*\n${normalizedSummary}`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*✅ Action Items:*\n${actionItemsText}`
                    }
                },

                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `Posted by ${user.firstName || 'User'} · ${new Date().toLocaleString()}`
                        }
                    ]
                }
            ]
        })

        return NextResponse.json({
            success: true,
            message: `Meeting summary posted to ${dbUser.preferredChannelName || '#general'}`
        })
    } catch (error) {
        console.error('error posting to slack:', error)

        const slackError = (error as any)?.data?.error || (error as Error)?.message
        if (typeof slackError === 'string' && slackError.trim()) {
            return NextResponse.json({ error: `failed to post to slack: ${slackError}` }, { status: 400 })
        }

        return NextResponse.json({ error: 'failed to post to slack' }, { status: 500 })
    }
}