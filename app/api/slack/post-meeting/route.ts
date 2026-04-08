import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { WebClient } from "@slack/web-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
        }

        const { meetingId, summary, actionItems } = await request.json()

        if (!meetingId) {
            return NextResponse.json({ error: 'meeting id is required' }, { status: 400 })
        }

        const meeting = await prisma.meeting.findUnique({
            where: {
                id: meetingId
            },
            include: {
                user: true
            }
        })

        if (!meeting) {
            return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
        }

        if (meeting.user.clerkId !== user.id) {
            return NextResponse.json({ error: 'not authorized to post this meeting' }, { status: 403 })
        }

        let dbUser = meeting.user

        if (!dbUser.slackTeamId) {
            const activeInstallations = await prisma.slackInstallation.findMany({
                where: {
                    active: true
                },
                select: {
                    teamId: true
                },
                take: 2
            })

            if (activeInstallations.length === 1) {
                dbUser = await prisma.user.update({
                    where: {
                        id: dbUser.id
                    },
                    data: {
                        slackTeamId: activeInstallations[0].teamId,
                        slackConnected: true
                    }
                })
            }
        }

        if (!dbUser.slackTeamId) {
            return NextResponse.json({
                error: 'slack not connected. reconnect slack from integrations and try again.'
            }, { status: 400 })
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
        let channels: any[] = []

        try {
            const channelsResponse = await slack.conversations.list({
                types: 'public_channel,private_channel',
                exclude_archived: true,
                limit: 200
            })

            channels = channelsResponse.channels || []
        } catch (listError) {
            console.warn('failed to list slack channels, will try dm fallback', listError)
        }

        const preferredChannelId = dbUser.preferredChannelId || ''
        const preferredChannel = preferredChannelId
            ? channels.find(channel => channel.id === preferredChannelId)
            : null

        let targetChannel = ''

        if (preferredChannel?.id && preferredChannel.is_member) {
            targetChannel = preferredChannel.id
        } else {
            const memberChannel = channels.find(channel => channel.id && channel.is_member)
            targetChannel = memberChannel?.id || ''
        }

        if (!targetChannel && dbUser.slackUserId) {
            try {
                const dm = await slack.conversations.open({
                    users: dbUser.slackUserId
                })

                targetChannel = dm.channel?.id || ''
            } catch (dmError) {
                console.warn('failed to open slack dm fallback', dmError)
            }
        }

        if (!targetChannel) {
            return NextResponse.json({
                error: 'bot is not in any channel and dm fallback failed. invite the app to a Slack channel or reconnect Slack.'
            }, { status: 400 })
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

        const plainTextMessage = [
            `Meeting Summary: ${meetingTitle}`,
            `Date: ${new Date(meeting.startTime).toLocaleString()}`,
            '',
            `Summary: ${normalizedSummary}`,
            '',
            `Action Items:\n${actionItemsText}`
        ].join('\n')

        await slack.chat.postMessage({
            channel: targetChannel,
            text: plainTextMessage,
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

        const usedPreferredChannel = Boolean(preferredChannel?.id && preferredChannel.is_member)

        return NextResponse.json({
            success: true,
            message: usedPreferredChannel
                ? `Meeting summary posted to ${dbUser.preferredChannelName || '#general'}`
                : 'Meeting summary posted successfully.'
        })
    } catch (error) {
        console.error('error posting to slack:', error)

        const slackError = (error as any)?.data?.error || (error as Error)?.message
        if (slackError === 'not_in_channel') {
            return NextResponse.json({
                error: 'failed to post to slack: bot is not in that channel. invite the app to the channel and try again.'
            }, { status: 400 })
        }

        if (typeof slackError === 'string' && slackError.trim()) {
            return NextResponse.json({ error: `failed to post to slack: ${slackError}` }, { status: 400 })
        }

        return NextResponse.json({ error: 'failed to post to slack' }, { status: 500 })
    }
}