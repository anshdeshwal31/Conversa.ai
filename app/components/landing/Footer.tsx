import { Sparkles } from 'lucide-react'
import React from 'react'

function Footer() {
    return (
        <footer className='px-1 py-4 md:px-2'>
            <div className='surface-frame max-w-[1320px] mx-auto px-6 py-7'>
                <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-center'>
                    <div className='flex items-center space-x-2'>
                        <div className='w-8 h-8 bg-primary/18 border border-primary/40 rounded-lg flex items-center justify-center'>
                            <Sparkles className='w-4 h-4 text-primary' />
                        </div>
                        <span className='text-xl font-semibold text-white'>Conversa Studio</span>
                    </div>
                    <div className='text-white/50 text-sm'>
                        &copy; {new Date().getFullYear()} Conversa Studio. Built for cinematic meeting execution.
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
