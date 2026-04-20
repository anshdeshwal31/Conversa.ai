'use client'

import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CTASection() {
    const { isSignedIn } = useUser()
    return (
        <section className='px-1 py-4 md:px-2'>
            <div className='surface-frame max-w-[1320px] mx-auto p-5 sm:p-7 md:p-12 text-center ambient-panel relative overflow-hidden'>
                <div className='hero-glow hero-glow-rose top-[-14%] right-[-8%] w-[220px] h-[180px] sm:w-[280px] sm:h-[240px] md:w-[320px] md:h-[280px]' />
                <div className='hero-glow hero-glow-rose bottom-[-18%] left-[-10%] w-[230px] h-[190px] sm:w-[300px] sm:h-[250px] md:w-[360px] md:h-[300px]' />
                <div className='relative z-10'>
                    <span className='section-kicker'>Launch</span>
                    <h2 className='text-3xl md:text-5xl font-semibold text-white mt-5 mb-4'>
                        Build. Test. <span className='accent-text'>Deploy meeting intelligence.</span>
                </h2>
                    <p className='text-lg text-white/60 mb-8 max-w-2xl mx-auto'>
                        Switch from fragmented call notes to a unified execution layer in under 30 seconds.
                    </p>
                    {isSignedIn ? (
                        <Button asChild size='lg' className='mono-btn-solid px-8 py-4 rounded-full group'>
                            <Link href='/home' className='group'>
                                <span>Go To Workspace</span>
                                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild size='lg' className='mono-btn-solid px-8 py-4 rounded-full group'>
                            <Link href='/sign-up' className='group'>
                                <span>Start Free Trial</span>
                                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                            </Link>
                        </Button>
                    )}
                    <div className='flex items-center justify-center space-x-1 mt-6'>
                        <Star className='w-5 h-5 text-primary fill-current' />
                        <Star className='w-5 h-5 text-primary fill-current' />
                        <Star className='w-5 h-5 text-primary fill-current' />
                        <Star className='w-5 h-5 text-primary fill-current' />
                        <Star className='w-5 h-5 text-primary fill-current' />
                        <span className='ml-2 text-white/52'>4.9/5 from early teams</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTASection
