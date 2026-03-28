import { prisma } from "@/lib/db";
import { canUserChat, incrementChatUsage } from "@/lib/usage";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Not authed' }, { status: 401 })
        }

        const clerkUser = await currentUser()
        const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null
        const name = clerkUser?.fullName ?? null

        const user = await prisma.user.upsert({
            where: {
                clerkId: userId
            },
            update: {
                ...(email ? { email } : {}),
                ...(name ? { name } : {})
            },
            create: {
                id: userId,
                clerkId: userId,
                email,
                name
            },
            select: {
                id: true,
                currentPlan: true,
                subscriptionStatus: true,
                chatMessagesToday: true
            }
        })

        const chatCheck = await canUserChat(user.id)

        if (!chatCheck.allowed) {
            return NextResponse.json({
                error: chatCheck.reason,
                upgradeRequired: true
            }, { status: 403 })
        }

        await incrementChatUsage(user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'failed to incrmeent usage' }, { status: 500 })
    }
}