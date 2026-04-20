'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'

export type PillNavItem = {
    label: string
    href: string
    ariaLabel?: string
}

export interface PillNavProps {
    logo?: string
    logoAlt?: string
    items: PillNavItem[]
    activeHref?: string
    className?: string
    ease?: string
    baseColor?: string
    pillColor?: string
    hoveredPillTextColor?: string
    pillTextColor?: string
    initialLoadAnimation?: boolean
    theme?: 'light' | 'dark'
}

const isExternalLink = (href: string) => (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
)

export default function PillNav({
    logo,
    logoAlt = 'Logo',
    items,
    activeHref,
    className = '',
    ease = 'power3.easeOut',
    baseColor = 'rgba(12, 10, 16, 0.88)',
    pillColor = 'rgba(247, 248, 250, 0.94)',
    hoveredPillTextColor = '#f8fafc',
    pillTextColor,
    initialLoadAnimation = true,
}: PillNavProps) {
    const resolvedPillTextColor = pillTextColor ?? '#08090c'

    const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
    const tlRefs = useRef<Array<gsap.core.Timeline | null>>([])
    const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
    const logoSpinRef = useRef<HTMLSpanElement | null>(null)
    const logoTweenRef = useRef<gsap.core.Tween | null>(null)
    const navItemsRef = useRef<HTMLDivElement | null>(null)
    const logoRef = useRef<HTMLAnchorElement | null>(null)

    useEffect(() => {
        const timelineRefs = tlRefs.current
        const tweenRefs = activeTweenRefs.current

        const layout = () => {
            circleRefs.current.forEach((circle, index) => {
                if (!circle?.parentElement) {
                    return
                }

                const pill = circle.parentElement as HTMLElement
                const rect = pill.getBoundingClientRect()
                const { width, height } = rect

                if (width <= 0 || height <= 0) {
                    return
                }

                const radius = ((width * width) / 4 + height * height) / (2 * height)
                const diameter = Math.ceil(2 * radius) + 2
                const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1
                const originY = diameter - delta

                circle.style.width = `${diameter}px`
                circle.style.height = `${diameter}px`
                circle.style.bottom = `-${delta}px`

                gsap.set(circle, {
                    xPercent: -50,
                    scale: 0,
                    transformOrigin: `50% ${originY}px`
                })

                const label = pill.querySelector<HTMLElement>('.pill-label')
                const hoverLabel = pill.querySelector<HTMLElement>('.pill-label-hover')

                if (label) gsap.set(label, { y: 0 })
                if (hoverLabel) gsap.set(hoverLabel, { y: height + 12, opacity: 0 })

                tlRefs.current[index]?.kill()
                const tl = gsap.timeline({ paused: true })

                tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.7, ease, overwrite: 'auto' }, 0)

                if (label) {
                    tl.to(label, { y: -(height + 8), duration: 0.7, ease, overwrite: 'auto' }, 0)
                }

                if (hoverLabel) {
                    gsap.set(hoverLabel, { y: Math.ceil(height + 100), opacity: 0 })
                    tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.7, ease, overwrite: 'auto' }, 0)
                }

                tlRefs.current[index] = tl
            })
        }

        layout()
        window.addEventListener('resize', layout)

        if (document.fonts) {
            document.fonts.ready.then(layout).catch(() => { })
        }

        if (initialLoadAnimation) {
            const logo = logoRef.current
            const navItems = navItemsRef.current

            if (logo) {
                gsap.set(logo, { scale: 0 })
                gsap.to(logo, { scale: 1, duration: 0.6, ease })
            }

            if (navItems) {
                gsap.set(navItems, { width: 0, overflow: 'hidden' })
                gsap.to(navItems, {
                    width: 'auto',
                    duration: 0.6,
                    ease,
                    onComplete: () => {
                        navItems.style.overflow = 'visible'
                    }
                })
            }
        }

        return () => {
            window.removeEventListener('resize', layout)
            timelineRefs.forEach((tl) => tl?.kill())
            tweenRefs.forEach((tween) => tween?.kill())
            logoTweenRef.current?.kill()
        }
    }, [ease, initialLoadAnimation, items])

    const handleEnter = (index: number) => {
        const tl = tlRefs.current[index]
        if (!tl) return

        activeTweenRefs.current[index]?.kill()
        activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
            duration: 0.3,
            ease,
            overwrite: 'auto'
        })
    }

    const handleLeave = (index: number) => {
        const tl = tlRefs.current[index]
        if (!tl) return

        activeTweenRefs.current[index]?.kill()
        activeTweenRefs.current[index] = tl.tweenTo(0, {
            duration: 0.22,
            ease,
            overwrite: 'auto'
        })
    }

    const handleLogoEnter = () => {
        if (!logoSpinRef.current) {
            return
        }

        logoTweenRef.current?.kill()
        gsap.set(logoSpinRef.current, { rotate: 0 })
        logoTweenRef.current = gsap.to(logoSpinRef.current, {
            rotate: 360,
            duration: 0.35,
            ease,
            overwrite: 'auto'
        })
    }

    const cssVars = {
        ['--base' as string]: baseColor,
        ['--pill-bg' as string]: pillColor,
        ['--hover-text' as string]: hoveredPillTextColor,
        ['--pill-text' as string]: resolvedPillTextColor,
        ['--nav-h' as string]: '42px',
        ['--logo' as string]: '36px',
        ['--pill-pad-x' as string]: '18px',
        ['--pill-gap' as string]: '3px'
    } as React.CSSProperties

    return (
        <div className={`relative ${className}`.trim()} style={cssVars}>
            <nav className='w-max flex items-center justify-start' aria-label='Primary'>
            {logo && (
                <Link
                    href='/'
                    aria-label='Home'
                    ref={logoRef}
                    onMouseEnter={handleLogoEnter}
                    className='rounded-full p-1.5 inline-flex items-center justify-center overflow-hidden border border-white/20'
                    style={{
                        width: 'var(--nav-h)',
                        height: 'var(--nav-h)',
                        background: 'var(--base)'
                    }}
                >
                    <span ref={logoSpinRef} className='relative block w-full h-full rounded-full overflow-hidden'>
                        <Image
                            src={logo}
                            alt={logoAlt}
                            fill
                            sizes='36px'
                            className='object-cover rounded-full'
                            draggable={false}
                        />
                    </span>
                </Link>
            )}

            <div
                ref={navItemsRef}
                className='relative hidden md:flex items-center rounded-full ml-2 border border-white/10'
                style={{
                    height: 'var(--nav-h)',
                    background: 'var(--base)'
                }}
            >
                <ul role='menubar' className='list-none flex items-stretch m-0 p-[3px] h-full' style={{ gap: 'var(--pill-gap)' }}>
                {items.map((item, index) => {
                    const isActive = activeHref === item.href || Boolean(activeHref && item.href !== '/' && activeHref.startsWith(`${item.href}/`))

                    const pillStyle: React.CSSProperties = {
                        background: 'var(--pill-bg)',
                        color: 'var(--pill-text)',
                        paddingLeft: 'var(--pill-pad-x)',
                        paddingRight: 'var(--pill-pad-x)'
                    }

                    const content = (
                        <>
                            <span
                                className='hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none'
                                style={{
                                    background: 'var(--base)',
                                    willChange: 'transform'
                                }}
                                aria-hidden='true'
                                ref={(el) => {
                                    circleRefs.current[index] = el
                                }}
                            />

                            <span className='label-stack relative inline-block leading-[1] z-[2]'>
                                <span className='pill-label relative z-[2] inline-block leading-[1]' style={{ willChange: 'transform' }}>
                                    {item.label}
                                </span>
                                <span
                                    className='pill-label-hover absolute left-0 top-0 z-[3] inline-block'
                                    style={{
                                        color: 'var(--hover-text)',
                                        willChange: 'transform, opacity'
                                    }}
                                    aria-hidden='true'
                                >
                                    {item.label}
                                </span>
                            </span>

                            {isActive && (
                                <span
                                    className='absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-2.5 h-2.5 rounded-full z-[4]'
                                    style={{ background: 'var(--base)' }}
                                    aria-hidden='true'
                                />
                            )}
                        </>
                    )

                    const basePillClasses =
                        'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-medium text-[13px] leading-[1] tracking-[0.06em] whitespace-nowrap cursor-pointer'

                    return (
                        <li key={item.href} role='none' className='flex h-full'>
                            {!isExternalLink(item.href) ? (
                                <Link
                                    role='menuitem'
                                    href={item.href}
                                    className={basePillClasses}
                                    style={pillStyle}
                                    aria-label={item.ariaLabel || item.label}
                                    onMouseEnter={() => handleEnter(index)}
                                    onMouseLeave={() => handleLeave(index)}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <a
                                    role='menuitem'
                                    href={item.href}
                                    className={basePillClasses}
                                    style={pillStyle}
                                    aria-label={item.ariaLabel || item.label}
                                    onMouseEnter={() => handleEnter(index)}
                                    onMouseLeave={() => handleLeave(index)}
                                >
                                    {content}
                                </a>
                            )}
                        </li>
                    )
                })}
                </ul>
            </div>
            </nav>
        </div>
    )
}
