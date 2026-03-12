import React from 'react'

function StatsSection() {
    return (
        <section className='px-1 py-4 md:px-2'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='grid md:grid-cols-4 gap-4 md:gap-5'>
                    <div className='glass-card p-5 md:p-6 text-left'>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/45 mb-3'>Teams</p>
                        <div className='text-4xl font-semibold text-white mb-1'>
                            2+
                        </div>
                        <p className='text-white/62 text-sm'>Fast-growing teams onboarded</p>
                    </div>
                    <div className='glass-card p-5 md:p-6 text-left'>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/45 mb-3'>Reliability</p>
                        <div className='text-4xl font-semibold text-white mb-1'>
                            99.69%
                        </div>
                        <p className='text-white/62 text-sm'>Service and processing uptime</p>
                    </div>
                    <div className='glass-card p-5 md:p-6 text-left'>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/45 mb-3'>Setup</p>
                        <div className='text-4xl font-semibold text-white mb-1'>
                            2min
                        </div>
                        <p className='text-white/62 text-sm'>Average first-run configuration</p>
                    </div>
                    <div className='glass-card p-5 md:p-6 text-left'>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/45 mb-3'>Savings</p>
                        <div className='text-4xl font-semibold text-white mb-1'>
                            50hrs
                        </div>
                        <p className='text-white/62 text-sm'>Monthly meeting ops reclaimed</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StatsSection
