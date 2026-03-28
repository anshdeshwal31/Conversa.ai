import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'unautorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.upsert({
            where: {
                clerkId: user.id
            },
            update: {
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null
            },
            create: {
                id: user.id,
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null
            },
            select: {
                botName: true,
                botImageUrl: true,
                currentPlan: true
            }
        })

        return NextResponse.json({
            botName: dbUser?.botName || 'Meeting Bot',
            botImageUrl: dbUser?.botImageUrl || null,
            plan: dbUser?.currentPlan || 'free'
        })
    } catch (error) {
        console.error('error fetching bot settings:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}


export async function POST(request: Request) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'unautorized' }, { status: 401 })
        }

        const { botName, botImageUrl } = await request.json()

        await prisma.user.upsert({
            where: {
                clerkId: user.id
            },
            update: {
                botName: botName || 'Meeting Bot',
                botImageUrl: botImageUrl,
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null
            },
            create: {
                id: user.id,
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null,
                botName: botName || 'Meeting Bot',
                botImageUrl: botImageUrl
            },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('error saving bot settings:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}