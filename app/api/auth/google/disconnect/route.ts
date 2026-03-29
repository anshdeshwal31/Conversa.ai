import { prisma } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Not authed" }, { status: 401 })
        }

        const clerkUser = await currentUser()
        const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null
        const name = clerkUser?.fullName ?? null

        await prisma.user.upsert({
            where: {
                clerkId: userId
            },
            update: {
                calendarConnected: false,
                googleAccessToken: null,
                googleRefreshToken: null,
                googleTokenExpiry: null,
                ...(email ? { email } : {}),
                ...(name ? { name } : {})
            },
            create: {
                id: userId,
                clerkId: userId,
                email,
                name,
                calendarConnected: false,
                googleAccessToken: null,
                googleRefreshToken: null,
                googleTokenExpiry: null
            }
        })

        return NextResponse.json({ success: true, message: "cal disconnected succesfuly" })
    } catch (error) {
        console.error('disconnect error:', error)
        return NextResponse.json({ error: 'failed to disconnect calendar ' }, { status: 500 })
    }
}