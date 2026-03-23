'use client'

import { useUser } from '@clerk/nextjs'
import { Check, Loader2, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

declare global {
    interface Window {
        Razorpay: any
    }
}

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 9,
        amount: 900,
        description: 'Perfect for people getting started',
        features: [
            '10 meetings per month',
            '30 AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications'
        ],
        popular: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        amount: 2900,
        description: 'Perfect for people growing who need more power',
        features: [
            '30 meetings per month',
            '100 AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications',
            'Priority Support'
        ],
        popular: true
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 99,
        amount: 9900,
        description: 'Perfect for people who need unlimited limits',
        features: [
            'Unlimited meetings per month',
            'Unlimited AI chat messages per day',
            'Meeting transcripts and summaries',
            'Action items extraction',
            'Email Notifications',
            'Priority Support'
        ],
        popular: false
    },

]

const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
        if (typeof window === 'undefined') {
            resolve(false)
            return
        }

        if (window.Razorpay) {
            resolve(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

function Pricing() {
    const { user } = useUser()
    const [loading, setLoading] = useState<string | null>(null)

    const handleSubscribe = async (amount: number, planName: string) => {
        if (!user) {
            return
        }

        setLoading(planName)

        try {
            const scriptLoaded = await loadRazorpayScript()

            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay checkout script')
            }

            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    planName
                })
            })

            const data = await response.json()

            if (!response.ok || !data.orderId || !data.key) {
                throw new Error(data.error || 'Failed to create checkout session')
            }

            await new Promise<void>((resolve, reject) => {
                const razorpay = new window.Razorpay({
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'Convorbit AI',
                    description: `${planName} Plan`,
                    order_id: data.orderId,
                    prefill: {
                        name: user.fullName || '',
                        email: user.primaryEmailAddress?.emailAddress || ''
                    },
                    handler: async (paymentResponse: {
                        razorpay_order_id: string
                        razorpay_payment_id: string
                        razorpay_signature: string
                    }) => {
                        try {
                            const verifyResponse = await fetch('/api/stripe/verify-payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    ...paymentResponse,
                                    planName
                                })
                            })

                            const verifyData = await verifyResponse.json()

                            if (!verifyResponse.ok) {
                                throw new Error(verifyData.error || 'Payment verification failed')
                            }

                            window.location.href = '/home?success=true'
                            resolve()
                        } catch (error) {
                            reject(error)
                        }
                    },
                    modal: {
                        ondismiss: () => resolve()
                    }
                })

                razorpay.on('payment.failed', () => resolve())
                razorpay.open()
            })
        } catch (error) {
            console.error('subscription creation error:', error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className='min-h-screen py-8 md:py-12'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10 ambient-panel relative overflow-hidden'>
                <div className='hero-glow hero-glow-rose top-[-20%] right-[-8%] w-[420px] h-[320px]' />
                <div className='hero-glow hero-glow-rose bottom-[-26%] left-[-12%] w-[420px] h-[300px]' />

                <div className='max-w-3xl text-center mx-auto mb-10 md:mb-14 relative z-10'>
                    <div className='section-kicker'>
                        <Sparkles className='w-3.5 h-3.5 text-primary' />
                        Pricing
                    </div>
                    <h2 className='text-3xl md:text-5xl font-semibold text-white mt-5 mb-4'>
                        Start fast.
                        <span className='accent-text'> Scale without friction.</span>
                    </h2>
                    <p className='text-white/62 text-base md:text-lg max-w-2xl mx-auto'>
                        Automatic summaries, action items, and intelligent insights for every meeting.
                        Never miss important details again.
                    </p>
                </div>

                <div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch relative z-10'>
                    {plans.map((plan) => {
                        const isLoading = loading === plan.name

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-3xl p-[1px] ${plan.popular
                                    ? 'bg-gradient-to-b from-primary/80 via-accent/45 to-transparent'
                                    : 'bg-white/[0.14]'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 z-10'>
                                        <span className='px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className={`flex flex-col flex-1 rounded-3xl p-6 md:p-7 ${plan.popular
                                    ? 'bg-[#160d16]/96'
                                    : 'bg-[#120c14]/82 backdrop-blur-sm'
                                    }`}>
                                    <div className='text-center mb-6'>
                                        <h3 className='text-lg font-semibold text-white mb-2 tracking-wide'>{plan.name}</h3>
                                        <div className='mb-3'>
                                            <span className='text-5xl font-bold text-white'>${plan.price}</span>
                                            <span className='text-white/45 text-sm ml-1'>/month</span>
                                        </div>
                                        <p className='text-sm text-white/55'>{plan.description}</p>
                                    </div>

                                    <div className='flex-1'>
                                        <ul className='space-y-3'>
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className='flex items-start gap-3'>
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular
                                                        ? 'bg-primary/25 text-primary'
                                                        : 'bg-white/10 text-white/75'
                                                        }`}>
                                                        <Check className='w-3 h-3' />
                                                    </div>
                                                    <span className='text-sm text-white/74'>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        className={`w-full mt-8 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${plan.popular
                                            ? 'bg-primary text-primary-foreground shadow-[0_12px_26px_rgba(244,90,163,0.35)] hover:brightness-110'
                                            : 'bg-white/[0.06] text-white/80 border border-white/[0.16] hover:bg-white/[0.11] hover:border-primary/40'
                                            }`}
                                        onClick={() => handleSubscribe(plan.amount, plan.name)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <Loader2 className='w-4 h-4 animate-spin' />
                                                Processing...
                                            </span>
                                        ) : (
                                            `Subscribe to ${plan.name}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className='mt-8 max-w-3xl mx-auto text-center text-sm text-white/50 relative z-10'>
                    No lock-in. Switch plans anytime. Access remains immediate after checkout.
                </div>
            </div>
        </div>
    )
}

export default Pricing
