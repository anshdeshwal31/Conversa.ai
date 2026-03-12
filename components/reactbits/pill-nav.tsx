'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

type PillNavItem = {
    label: string
    href: string
    ariaLabel?: string
}

type PillNavProps = {
    logo?: string
    logoAlt?: string
    items: PillNavItem[]
    activeHref?: string
    className?: string
    baseColor?: string
    pillColor?: string
    hoveredPillTextColor?: string
    pillTextColor?: string
    onMobileMenuClick?: () => void
    initialLoadAnimation?: boolean
}

export default function PillNav({
    logo,
    logoAlt = 'Logo',
    items,
    activeHref,
    className = '',
    baseColor = '#ffffff',
    pillColor = '#120f16',
    hoveredPillTextColor = '#ffffff',
    pillTextColor,
    onMobileMenuClick,
    initialLoadAnimation = false
}: PillNavProps) {
    const textColor = pillTextColor || baseColor

    return (
        <div
            className={`relative flex items-center gap-2 rounded-full border px-2 py-1.5 backdrop-blur-md ${initialLoadAnimation ? 'micro-fade-in' : ''} ${className}`.trim()}
            style={{
                backgroundColor: 'rgba(16, 12, 18, 0.74)',
                borderColor: 'rgba(216, 220, 228, 0.24)'
            }}
        >
            {logo && (
                <img
                    src={logo}
                    alt={logoAlt}
                    className='h-7 w-7 rounded-full object-cover border border-white/20'
                />
            )}

            <nav className='flex items-center gap-1' aria-label='Primary'>
                {items.map((item) => {
                    const isActive = activeHref === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.ariaLabel || item.label}
                            className='relative rounded-full px-4 py-2 text-xs font-medium transition-all duration-200'
                            style={{
                                color: isActive ? hoveredPillTextColor : textColor,
                                backgroundColor: isActive ? pillColor : 'transparent',
                                border: isActive ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent'
                            }}
                            onMouseEnter={(event) => {
                                if (!isActive) {
                                    event.currentTarget.style.color = hoveredPillTextColor
                                    event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                                }
                            }}
                            onMouseLeave={(event) => {
                                if (!isActive) {
                                    event.currentTarget.style.color = textColor
                                    event.currentTarget.style.backgroundColor = 'transparent'
                                }
                            }}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {onMobileMenuClick && (
                <button
                    type='button'
                    onClick={onMobileMenuClick}
                    aria-label='Open menu'
                    className='rounded-full border border-white/15 p-2 text-white/80 hover:bg-white/10 transition-colors'
                >
                    <Menu className='h-4 w-4' />
                </button>
            )}
        </div>
    )
}
