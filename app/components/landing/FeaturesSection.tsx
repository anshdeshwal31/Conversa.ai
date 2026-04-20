'use client'

import MagicBento from '@/components/reactbits/MagicBento'
import React from 'react'

function FeaturesSection() {
    return (
        <section className='px-1 py-4 md:px-2' id='features'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='mb-12 md:mb-14'>
                    <span className='section-kicker'>Platform Capabilities</span>
                    <h2 className='text-3xl md:text-5xl font-semibold text-white mt-5 mb-4 max-w-3xl'>
                        Familiar Git-style execution.
                        <span className='accent-text ml-2'>Purpose-built for meetings.</span>
                    </h2>
                    <p className='text-base md:text-lg max-w-2xl text-white/60'>
                        Structured flows for summaries, decisions, tasks, and integrations. Every block is designed to turn conversation into execution.
                    </p>
                </div>
                <MagicBento
                    textAutoHide={true}
                    enableStars
                    enableSpotlight
                    enableBorderGlow={true}
                    enableTilt={false}
                    enableMagnetism={false}
                    clickEffect
                    spotlightRadius={400}
                    particleCount={12}
                    glowColor="200, 210, 230"
                    disableAnimations={false}
                />
            </div>
        </section>
    )
}

export default FeaturesSection
