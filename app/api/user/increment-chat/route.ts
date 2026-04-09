import { prisma } from "@/lib/db";
import { canUserChat, incrementChatUsage } from "@/lib/usage";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Not authed' }, { status: 401 })
        }

        const user = await prisma.user.upsert({
            where: {
                clerkId: userId
            },
            update: {},
            create: {
                id: userId,
                clerkId: userId,
                email: null,
                name: null
            },
            select: {
                id: true
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