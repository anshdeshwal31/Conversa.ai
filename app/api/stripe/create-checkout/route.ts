import { prisma } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        const user = await currentUser()

        if (!userId || !user) {
            return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
        }

        const { amount, planName } = await request.json()

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'valid amount is required' }, { status: 400 })
        }

        let dbUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: userId,
                    clerkId: userId,
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.fullName
                }
            })
        }

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
            notes: {
                clerkUserId: userId,
                dbUserId: dbUser.id,
                planName: planName || 'free'
            }
        })

        return NextResponse.json({
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: planName || 'free'
        })
    } catch (error) {
        console.error('razorpay order creation error:', error)
        return NextResponse.json({ error: 'failed to create razorpay order' }, { status: 500 })
    }
}