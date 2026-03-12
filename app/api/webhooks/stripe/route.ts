import { prisma } from "@/lib/db";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get('x-razorpay-signature')

        if (!signature || !webhookSecret) {
            return NextResponse.json({ error: 'invalid webhook configuration' }, { status: 400 })
        }

        const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')

        if (expected !== signature) {
            return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
        }

        const payload = JSON.parse(body)
        const event = payload?.event as string | undefined

        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payload?.payload?.payment?.entity
            const notes = paymentEntity?.notes || {}
            const clerkUserId = notes?.clerkUserId as string | undefined
            const planName = typeof notes?.planName === 'string' ? notes.planName.toLowerCase() : 'free'

            if (clerkUserId) {
                const dbUser = await prisma.user.findUnique({
                    where: {
                        clerkId: clerkUserId
                    }
                })

                if (dbUser) {
                    await prisma.user.update({
                        where: {
                            id: dbUser.id
                        },
                        data: {
                            currentPlan: ['starter', 'pro', 'premium'].includes(planName) ? planName : 'free',
                            subscriptionStatus: 'active',
                            billingPeriodStart: new Date(),
                            meetingsThisMonth: 0,
                            chatMessagesToday: 0
                        }
                    })
                }
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('error handling razorpay webhook:', error)
        return NextResponse.json({ error: 'webhook failed' }, { status: 500 })
    }
}