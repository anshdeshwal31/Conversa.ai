import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ connected: false })
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
                calendarConnected: true,
                googleAccessToken: true
            }
        })

        return NextResponse.json({
            connected: user?.calendarConnected && !!user.googleAccessToken
        })
    } catch (error) {
        return NextResponse.json({ connected: false })
    }
}