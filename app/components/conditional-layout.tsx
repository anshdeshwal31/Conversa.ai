'use client'

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { GlobalNavbar } from "./global-navbar";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { isSignedIn } = useAuth()

    const showFrame = !pathname.startsWith('/api')
    const isSharedMeetingView = pathname.startsWith('/meeting/') && !isSignedIn

    if (!showFrame) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen pb-6 md:pb-10">
            <GlobalNavbar />
            <main className={isSharedMeetingView ? "px-0 pb-0" : "px-3 pb-8 md:px-5"}>
                <div className={isSharedMeetingView ? "" : "max-w-[1320px] mx-auto"}>
                    {children}
                </div>
            </main>
        </div>
    )
}