import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'not authed' }, { status: 401 })
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