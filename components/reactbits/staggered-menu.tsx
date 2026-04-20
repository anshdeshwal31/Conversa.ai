'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type StaggeredMenuItem = {
    label: string
    href: string
    ariaLabel?: string
}

interface StaggeredMenuProps {
    position?: 'left' | 'right'
    colors?: string[]
    items: StaggeredMenuItem[]
    className?: string
    logoUrl?: string
    menuButtonColor?: string
    openMenuButtonColor?: string
    changeMenuColorOnOpen?: boolean
    isFixed?: boolean
    accentColor?: string
    closeOnClickAway?: boolean
    displayItemNumbering?: boolean
    onMenuOpen?: () => void
    onMenuClose?: () => void
    footer?: React.ReactNode
}

const isExternalLink = (href: string) => (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
)

export default function StaggeredMenu({
    position = 'right',
    colors = ['rgba(20, 16, 28, 0.96)', 'rgba(10, 8, 16, 0.98)'],
    items,
    className,
    logoUrl,
    menuButtonColor = '#f8fafc',
    openMenuButtonColor = '#ffffff',
    changeMenuColorOnOpen = true,
    isFixed = true,
    accentColor = '#f4f5f7',
    closeOnClickAway = true,
    displayItemNumbering = true,
    onMenuOpen,
    onMenuClose,
    footer
}: StaggeredMenuProps) {
    const [open, setOpen] = useState(false)
    const [textLines] = useState(['Menu', 'Close'])

    const panelRef = useRef<HTMLDivElement | null>(null)
    const preLayerRefs = useRef<Array<HTMLDivElement | null>>([])

    const plusHRef = useRef<HTMLSpanElement | null>(null)
    const plusVRef = useRef<HTMLSpanElement | null>(null)
    const textInnerRef = useRef<HTMLSpanElement | null>(null)
    const toggleBtnRef = useRef<HTMLButtonElement | null>(null)

    const openTlRef = useRef<gsap.core.Timeline | null>(null)
    const closeTweenRef = useRef<gsap.core.Tween | null>(null)

    useLayoutEffect(() => {
        const panel = panelRef.current
        const layers = preLayerRefs.current.filter((layer): layer is HTMLDivElement => Boolean(layer))

        if (!panel) {
            return
        }

        const offscreen = position === 'left' ? -120 : 120
        gsap.set([...layers, panel], { xPercent: offscreen })

        if (plusHRef.current && plusVRef.current && textInnerRef.current) {
            gsap.set(plusHRef.current, { rotate: 0, transformOrigin: '50% 50%' })
            gsap.set(plusVRef.current, { rotate: 90, transformOrigin: '50% 50%' })
            gsap.set(textInnerRef.current, { yPercent: 0 })
        }

        if (toggleBtnRef.current) {
            gsap.set(toggleBtnRef.current, { color: menuButtonColor })
        }
    }, [menuButtonColor, position])

    useEffect(() => {
        if (!isFixed) {
            return
        }

        const original = document.body.style.overflow

        if (open) {
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.body.style.overflow = original
        }
    }, [isFixed, open])

    const playOpen = useCallback(() => {
        const panel = panelRef.current
        if (!panel) {
            return
        }

        const layers = preLayerRefs.current.filter((layer): layer is HTMLDivElement => Boolean(layer))
        const itemLabels = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemLabel'))
        const numberEls = Array.from(panel.querySelectorAll<HTMLElement>('.sm-panel-itemNumber'))
        const socialBlock = panel.querySelector<HTMLElement>('.sm-footer')

        openTlRef.current?.kill()
        closeTweenRef.current?.kill()

        if (itemLabels.length > 0) {
            gsap.set(itemLabels, { yPercent: 130, rotate: 8, opacity: 0 })
        }
        if (numberEls.length > 0) {
            gsap.set(numberEls, { opacity: 0 })
        }
        if (socialBlock) {
            gsap.set(socialBlock, { opacity: 0, y: 16 })
        }

        const tl = gsap.timeline()

        layers.forEach((layer, index) => {
            tl.to(layer, { xPercent: 0, duration: 0.42, ease: 'power4.out' }, index * 0.06)
        })

        tl.to(panel, { xPercent: 0, duration: 0.62, ease: 'power4.out' }, 0.1)

        if (itemLabels.length > 0) {
            tl.to(itemLabels, {
                yPercent: 0,
                rotate: 0,
                opacity: 1,
                duration: 0.65,
                ease: 'power3.out',
                stagger: 0.08
            }, 0.24)
        }

        if (numberEls.length > 0) {
            tl.to(numberEls, {
                opacity: 1,
                duration: 0.45,
                ease: 'power2.out',
                stagger: 0.08
            }, 0.34)
        }

        if (socialBlock) {
            tl.to(socialBlock, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.5)
        }

        openTlRef.current = tl
    }, [])

    const playClose = useCallback(() => {
        const panel = panelRef.current
        if (!panel) {
            return
        }

        const layers = preLayerRefs.current.filter((layer): layer is HTMLDivElement => Boolean(layer))
        const offscreen = position === 'left' ? -120 : 120

        openTlRef.current?.kill()
        closeTweenRef.current?.kill()

        closeTweenRef.current = gsap.to([...layers, panel], {
            xPercent: offscreen,
            duration: 0.3,
            ease: 'power3.in',
            overwrite: 'auto'
        })
    }, [position])

    const animateToggleIcon = useCallback((opening: boolean) => {
        if (!plusHRef.current || !plusVRef.current || !textInnerRef.current || !toggleBtnRef.current) {
            return
        }

        gsap.to(plusHRef.current, {
            rotate: opening ? 45 : 0,
            duration: 0.35,
            ease: opening ? 'power4.out' : 'power3.inOut'
        })

        gsap.to(plusVRef.current, {
            rotate: opening ? -45 : 90,
            duration: 0.35,
            ease: opening ? 'power4.out' : 'power3.inOut'
        })

        gsap.to(textInnerRef.current, {
            yPercent: opening ? -50 : 0,
            duration: 0.4,
            ease: 'power4.out'
        })

        const targetColor = changeMenuColorOnOpen
            ? opening
                ? openMenuButtonColor
                : menuButtonColor
            : menuButtonColor

        gsap.to(toggleBtnRef.current, {
            color: targetColor,
            duration: 0.25,
            ease: 'power2.out'
        })
    }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor])

    const closeMenu = useCallback(() => {
        setOpen(false)
        playClose()
        animateToggleIcon(false)
        onMenuClose?.()
    }, [animateToggleIcon, onMenuClose, playClose])

    const toggleMenu = () => {
        const opening = !open
        setOpen(opening)

        if (opening) {
            onMenuOpen?.()
            playOpen()
        } else {
            onMenuClose?.()
            playClose()
        }

        animateToggleIcon(opening)
    }

    useEffect(() => {
        if (!closeOnClickAway || !open) {
            return
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                panelRef.current &&
                !panelRef.current.contains(target) &&
                toggleBtnRef.current &&
                !toggleBtnRef.current.contains(target)
            ) {
                closeMenu()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [closeOnClickAway, closeMenu, open])

    const menuLayers = colors.length > 0 ? colors : ['rgba(20, 16, 28, 0.96)', 'rgba(10, 8, 16, 0.98)']

    return (
        <div
            className={`relative z-[90] ${className || ''}`.trim()}
            style={{ ['--sm-accent' as string]: accentColor } as React.CSSProperties}
            data-open={open || undefined}
        >
            <button
                ref={toggleBtnRef}
                className='relative inline-flex items-center gap-2 rounded-full border border-white/[0.2] bg-[#100d16]/80 px-3.5 py-2 text-sm font-medium leading-none backdrop-blur-sm cursor-pointer'
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls='staggered-menu-panel'
                onClick={toggleMenu}
                type='button'
            >
                <span className='relative inline-block h-[1em] overflow-hidden whitespace-nowrap w-[4.4ch]'>
                    <span ref={textInnerRef} className='flex flex-col leading-none'>
                        {textLines.map((line) => (
                            <span className='block h-[1em] leading-none' key={line}>
                                {line}
                            </span>
                        ))}
                    </span>
                </span>

                <span className='relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center'>
                    <span
                        ref={plusHRef}
                        className='absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2'
                    />
                    <span
                        ref={plusVRef}
                        className='absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2'
                    />
                </span>
            </button>

            <div
                className={`fixed inset-0 z-[95] overflow-x-hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!open}
            >
                {menuLayers.map((color, index) => (
                    <div
                        key={`${color}-${index}`}
                        ref={(el) => {
                            preLayerRefs.current[index] = el
                        }}
                        className={`absolute top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-[86vw] max-w-[520px] pointer-events-none`}
                        style={{ background: color }}
                    />
                ))}

                <aside
                    id='staggered-menu-panel'
                    ref={panelRef}
                    className={`absolute top-0 ${position === 'left' ? 'left-0' : 'right-0'} z-[100] h-screen w-[86vw] max-w-[520px] bg-[#f8fafc] text-[#0b0d11] flex flex-col p-6 sm:p-8 overflow-y-auto pointer-events-auto`}
                    aria-hidden={!open}
                >
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center gap-3'>
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt='Convorbit logo'
                                width={32}
                                height={32}
                                className='h-8 w-8 rounded-lg object-cover border border-black/10'
                                draggable={false}
                            />
                        ) : null}
                        <p className='text-xs uppercase tracking-[0.2em] text-black/55'>Navigation</p>
                    </div>
                </div>

                <ul className='list-none m-0 p-0 flex flex-col gap-2' role='list'>
                    {items.map((item, index) => (
                        <li className='relative overflow-hidden leading-none' key={item.href}>
                            {!isExternalLink(item.href) ? (
                                <Link
                                    className='group relative text-black font-semibold text-[clamp(1.9rem,8vw,3.2rem)] leading-none tracking-[-1px] uppercase inline-flex items-start gap-3 no-underline pr-2 py-1'
                                    href={item.href}
                                    aria-label={item.ariaLabel || item.label}
                                    onClick={closeMenu}
                                >
                                    {displayItemNumbering && (
                                        <span className='sm-panel-itemNumber text-xs mt-2 text-black/45 tracking-[0.14em]'>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    )}
                                    <span className='sm-panel-itemLabel inline-block transition-colors duration-200 group-hover:text-[var(--sm-accent)]'>
                                        {item.label}
                                    </span>
                                </Link>
                            ) : (
                                <a
                                    className='group relative text-black font-semibold text-[clamp(1.9rem,8vw,3.2rem)] leading-none tracking-[-1px] uppercase inline-flex items-start gap-3 no-underline pr-2 py-1'
                                    href={item.href}
                                    aria-label={item.ariaLabel || item.label}
                                    onClick={closeMenu}
                                >
                                    {displayItemNumbering && (
                                        <span className='sm-panel-itemNumber text-xs mt-2 text-black/45 tracking-[0.14em]'>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    )}
                                    <span className='sm-panel-itemLabel inline-block transition-colors duration-200 group-hover:text-[var(--sm-accent)]'>
                                        {item.label}
                                    </span>
                                </a>
                            )}
                        </li>
                    ))}
                </ul>

                {footer ? (
                    <div className='sm-footer mt-auto pt-6 border-t border-black/10' onClick={closeMenu}>
                        {footer}
                    </div>
                ) : null}
                </aside>
            </div>
        </div>
    )
}
