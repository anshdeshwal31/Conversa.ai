import { prisma } from "@/lib/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { currentUser } from "@clerk/nextjs/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Region = process.env.AWS_REGION
const s3Bucket = process.env.S3_BUCKET_NAME
const canSignBotImages = Boolean(
    s3Region &&
    s3Bucket &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
)

const botImageS3Client = canSignBotImages
    ? new S3Client({
        region: s3Region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    })
    : null

function sanitizeBotImageUrl(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim()

    if (!normalized || normalized === 'undefined' || normalized === 'null') {
        return null
    }

    return normalized
}

function normalizeBotImageStorageUrl(value: unknown): string | null {
    const sanitized = sanitizeBotImageUrl(value)

    if (!sanitized) {
        return null
    }

    try {
        const parsed = new URL(sanitized)
        parsed.search = ''
        parsed.hash = ''
        return parsed.toString()
    } catch {
        return sanitized
    }
}

function extractS3KeyFromUrl(imageUrl: string): string | null {
    try {
        const parsed = new URL(imageUrl)
        const hostname = parsed.hostname.toLowerCase()

        if (!hostname.includes('amazonaws.com')) {
            return null
        }

        const pathname = parsed.pathname.replace(/^\/+/, '')
        if (!pathname) {
            return null
        }

        if (s3Bucket && pathname.startsWith(`${s3Bucket}/`)) {
            return decodeURIComponent(pathname.slice(s3Bucket.length + 1))
        }

        return decodeURIComponent(pathname)
    } catch {
        return null
    }
}

async function buildBotImagePreviewUrl(storageUrl: string | null): Promise<string | null> {
    if (!storageUrl) {
        return null
    }

    if (!botImageS3Client || !s3Bucket) {
        return storageUrl
    }

    const key = extractS3KeyFromUrl(storageUrl)

    if (!key) {
        return storageUrl
    }

    try {
        return await getSignedUrl(
            botImageS3Client,
            new GetObjectCommand({
                Bucket: s3Bucket,
                Key: key,
            }),
            { expiresIn: 3600 }
        )
    } catch (error) {
        console.error('error generating signed bot avatar url:', error)
        return storageUrl
    }
}

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

        const botImageStorageUrl = normalizeBotImageStorageUrl(dbUser.botImageUrl)
        const botImagePreviewUrl = await buildBotImagePreviewUrl(botImageStorageUrl)

        return NextResponse.json({
            botName: dbUser?.botName || 'Meeting Bot',
            botImageUrl: botImagePreviewUrl,
            botImageStorageUrl,
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

        const { botName, botImageUrl, botImageStorageUrl } = await request.json()
        const normalizedBotImageStorageUrl = normalizeBotImageStorageUrl(botImageStorageUrl ?? botImageUrl)

        await prisma.user.upsert({
            where: {
                clerkId: user.id
            },
            update: {
                botName: botName || 'Meeting Bot',
                botImageUrl: normalizedBotImageStorageUrl,
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null
            },
            create: {
                id: user.id,
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || null,
                name: user.fullName || null,
                botName: botName || 'Meeting Bot',
                botImageUrl: normalizedBotImageStorageUrl
            },
        })

        return NextResponse.json({
            success: true,
            botImageStorageUrl: normalizedBotImageStorageUrl
        })
    } catch (error) {
        console.error('error saving bot settings:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}