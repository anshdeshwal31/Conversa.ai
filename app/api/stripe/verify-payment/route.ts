import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function normalizePlan(planName: string) {
    const normalized = planName.toLowerCase()

    if (normalized === 'free' || normalized === 'starter' || normalized === 'pro' || normalized === 'premium') {
        return normalized
    }

    return 'free'
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planName
        } = await request.json()
        const normalizedPlan = normalizePlan(planName || 'free')

        if (normalizedPlan === 'pro' || normalizedPlan === 'premium') {
            return NextResponse.json(
                { error: 'Pro and Premium activation is coming soon while Razorpay setup is pending.' },
                { status: 403 }
            )
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'invalid payment payload' }, { status: 400 })
        }

        const secret = process.env.RAZORPAY_KEY_SECRET

        if (!secret) {
            return NextResponse.json({ error: 'razorpay secret not configured' }, { status: 500 })
        }

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'payment signature verification failed' }, { status: 400 })
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        if (!dbUser) {
            return NextResponse.json({ error: 'user not found' }, { status: 404 })
        }

        await prisma.user.update({
            where: {
                id: dbUser.id
            },
            data: {
                currentPlan: normalizedPlan === 'free' ? 'starter' : normalizedPlan,
                subscriptionStatus: 'active',
                billingPeriodStart: new Date(),
                meetingsThisMonth: 0,
                chatMessagesToday: 0
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('razorpay verification error:', error)
        return NextResponse.json({ error: 'failed to verify payment' }, { status: 500 })
    }
}
