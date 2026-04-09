import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'not authed' }, { status: 401 })
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
                currentPlan: true,
                subscriptionStatus: true,
                meetingsThisMonth: true,
                chatMessagesToday: true,
                billingPeriodStart: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'failed to fetch usaged' }, { status: 500 })
    }
}