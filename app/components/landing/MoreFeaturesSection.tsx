import { BarChart3, Download, Settings } from 'lucide-react'
import React from 'react'

function MoreFeaturesSection() {
    return (
        <section className='px-1 py-4 md:px-2'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='mb-12'>
                    <span className='section-kicker'>Expansion</span>
                    <h2 className='text-3xl md:text-4xl font-semibold text-white mt-5 mb-3'>
                        Streamline artifact management
                        <span className='accent-text'> beyond summaries.</span>
                    </h2>
                    <p className='text-base md:text-lg text-white/60 max-w-2xl'>
                        Export, customize, and analyze with one consistent workspace.
                    </p>
                </div>
                <div className='grid md:grid-cols-3 gap-4 md:gap-5'>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 bg-[#1c1119] border border-primary/25 rounded-lg flex items-center justify-center mb-4'>
                            <Download className='w-6 h-6 text-primary' />
                        </div>
                        <h3 className='text-xl font-semibold text-white mb-2'>
                            Complete Meeting Exports
                        </h3>
                        <p className='text-white/60'>
                            Download audio MP3, transcripts, summaries, and action items.
                        </p>
                    </div>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 bg-[#2b1024]/85 border border-accent/35 rounded-lg flex items-center justify-center mb-4'>
                            <Settings className='w-6 h-6 text-accent' />
                        </div>
                        <h3 className='text-xl font-semibold text-white mb-2'>
                            Full Customization
                        </h3>
                        <p className='text-white/60'>
                            Customize bot name, image and toggle bot participation
                        </p>
                    </div>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 bg-[#1a121b]/90 border border-white/20 rounded-lg flex items-center justify-center mb-4'>
                            <BarChart3 className='w-6 h-6 text-white/85' />
                        </div>
                        <h3 className='text-xl font-semibold text-white mb-2'>
                            Meeting Analytics
                        </h3>
                        <p className='text-white/60'>
                            Track meeting patterns, participation rates, and productivity.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MoreFeaturesSection
