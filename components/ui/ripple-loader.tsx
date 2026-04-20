import React from 'react'

import { cn } from '@/lib/utils'

type RippleLoaderProps = {
    size?: number
    className?: string
    tone?: 'light' | 'dark'
}

function RippleLoader({
    size = 42,
    className,
    tone = 'light'
}: RippleLoaderProps) {
    const style = {
        ['--cv-loader-size' as string]: `${size}px`
    } as React.CSSProperties

    return (
        <span
            role='status'
            aria-label='Loading'
            className={cn('cv-loader', tone === 'dark' ? 'cv-loader-dark' : 'cv-loader-light', className)}
            style={style}
        >
            <span className='cv-loader-hole' aria-hidden='true'>
                {Array.from({ length: 10 }).map((_, index) => (
                    <i key={index} />
                ))}
            </span>
        </span>
    )
}

export default RippleLoader
