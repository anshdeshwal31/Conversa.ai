import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
        }

        return NextResponse.json(
            {
                error: 'Checkout is currently unavailable. Starter is free, and Pro/Premium are coming soon while Razorpay setup is pending.'
            },
            { status: 503 }
        )
    } catch (error) {
        console.error('checkout unavailable error:', error)
        return NextResponse.json({ error: 'checkout is unavailable' }, { status: 500 })
    }
}