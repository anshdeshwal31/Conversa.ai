import React from 'react'

function HowItWorksSection() {
    return (
        <section className='px-1 py-4 md:px-2' id='how-it-works'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='mb-12'>
                    <span className='section-kicker'>Workflow</span>
                    <h2 className='text-3xl md:text-4xl font-semibold text-white mt-5 mb-3'>
                        Ship context fast.
                        <span className='accent-text'> Automate everything.</span>
                    </h2>
                    <p className='text-white/60 text-base md:text-lg'>
                        Launch a meeting intelligence pipeline in three clear moves.
                    </p>
                </div>
                <div className='grid md:grid-cols-3 gap-4 md:gap-5'>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 mb-5 rounded-xl border border-primary/30 bg-primary/15 text-primary flex items-center justify-center text-xl font-bold'>
                            1
                        </div>
                        <h3 className='text-xl md:text-2xl font-semibold text-white mb-3'>Connect Calendar</h3>
                        <p className='text-white/60 leading-relaxed'>
                            Link your Google Calendar and we&apos;ll automatically detect your meetings
                        </p>
                    </div>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 mb-5 rounded-xl border border-primary/30 bg-primary/15 text-primary flex items-center justify-center text-xl font-bold'>
                            2
                        </div>
                        <h3 className='text-xl md:text-2xl font-semibold text-white mb-3'>Bot Joins Meeting</h3>
                        <p className='text-white/60 leading-relaxed'>
                            Our AI bot automatically joins and records your meetings with full transcription
                        </p>
                    </div>
                    <div className='glass-card-hover p-6 md:p-7'>
                        <div className='w-12 h-12 mb-5 rounded-xl border border-primary/30 bg-primary/15 text-primary flex items-center justify-center text-xl font-bold'>
                            3
                        </div>
                        <h3 className='text-xl md:text-2xl font-semibold text-white mb-3'>Get Insights</h3>
                        <p className='text-white/60 leading-relaxed'>
                            Receive summaries, action items, and push them to your favorite tools instantly
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
