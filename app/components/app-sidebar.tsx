import { Bot, CalendarCheck2, DollarSign, Home, Layers3, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUsage } from "../contexts/UsageContext";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const items = [
    {
        title: "Home",
        url: "/home",
        icon: Home,
    },
    {
        title: "Meetings",
        url: "/meeting",
        icon: CalendarCheck2,
    },
    {
        title: "Integrations",
        url: "/integrations",
        icon: Layers3,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Chat with AI",
        url: "/chat",
        icon: Bot,
    },
    {
        title: "Pricing",
        url: "/pricing",
        icon: DollarSign,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { usage, limits } = useUsage()

    const meetingProgress = usage && limits.meetings !== -1
        ? Math.min((usage.meetingsThisMonth / limits.meetings) * 100, 100)
        : 0

    const chatProgress = usage && limits.chatMessages !== -1
        ? Math.min((usage.chatMessagesToday / limits.chatMessages) * 100, 100)
        : 0


    const getUpgradeInfo = () => {
        if (!usage) return null

        switch (usage.currentPlan) {
            case 'free':
            case 'starter':
                return {
                    title: "Starter (Free)",
                    description: "You get 10 meetings/month and 30 chat messages/day.",
                    buttonLabel: "View Pricing",
                    showButton: true
                }

            case 'pro':
                return {
                    title: "Pro Plan",
                    description: "Pro checkout is marked Coming Soon until Razorpay is fully set up.",
                    buttonLabel: "View Pricing",
                    showButton: true
                }
            case 'premium':
                return {
                    title: "Premium Plan",
                    description: "Premium checkout is marked Coming Soon until Razorpay is fully set up.",
                    buttonLabel: "View Pricing",
                    showButton: true
                }

            default:
                return {
                    title: "Pricing",
                    description: "Starter is free. Pro and Premium are coming soon.",
                    buttonLabel: "View Pricing",
                    showButton: true
                }
        }
    }

    const upgradeInfo = getUpgradeInfo()
    const planLabel = usage?.currentPlan === 'free' ? 'STARTER (FREE)' : `${usage?.currentPlan.toUpperCase()} PLAN`

    return (
        <Sidebar collapsible="none" className="border-r border-white/[0.08] h-screen bg-[#06101b]">
            <SidebarHeader className="border-b border-white/[0.08] p-5">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/18 border border-primary/32">
                        <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-white">
                        Convorbit AI<span className="text-white/65">.ai</span>
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="flex-1 p-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1.5">
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                        ? 'bg-primary/15 text-primary border border-primary/25'
                                                        : 'text-white/56 hover:text-white hover:bg-white/[0.05]'
                                            }`}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 mt-auto">
                {usage && (
                    <div className="glass-card rounded-xl p-3.5 mb-3">
                        <p className="text-xs font-semibold text-white/75 mb-3 uppercase tracking-wider">
                            {planLabel}
                        </p>

                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/40">
                                    Meetings
                                </span>
                                <span className="text-xs text-white/40">
                                    {usage.meetingsThisMonth}/{limits.meetings === -1 ? '∞' : limits.meetings}
                                </span>
                            </div>
                            {limits.meetings !== -1 && (
                                    <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                                    <div
                                        className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${meetingProgress}%` }}
                                    > </div>
                                </div>
                            )}
                            {limits.meetings === -1 && (
                                <div className="text-xs text-white/30 italic">Unlimited</div>
                            )}
                        </div>

                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/40">
                                    Chat Messages
                                </span>
                                <span className="text-xs text-white/40">
                                    {usage.chatMessagesToday}/{limits.chatMessages === -1 ? '∞' : limits.chatMessages}
                                </span>
                            </div>
                            {limits.chatMessages !== -1 && (
                                <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                                    <div
                                        className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${chatProgress}%` }}
                                    > </div>
                                </div>
                            )}
                            {limits.chatMessages === -1 && (
                                <div className="text-xs text-white/30 italic">Unlimited</div>
                            )}
                        </div>

                    </div>
                )}

                {upgradeInfo && (
                    <div className="glass-card rounded-xl p-4 border-white/[0.12]">
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-white">
                                    {upgradeInfo.title}
                                </p>
                                <p className="text-xs text-white/40">
                                    {upgradeInfo.description}
                                </p>
                            </div>
                            {upgradeInfo.showButton && (
                                <Link href="/pricing">
                                    <Button className="w-full rounded-xl mono-btn-solid text-xs font-semibold cursor-pointer py-2.5">
                                        {upgradeInfo.buttonLabel || upgradeInfo.title}
                                    </Button>
                                </Link>
                            )}

                            {!upgradeInfo.showButton && (
                                <div className="text-center py-2">
                                    <span className="text-xs text-white/40">✨ Thank you for your support!</span>
                                </div>
                            )}

                        </div>
                    </div>
                )}

            </SidebarFooter>

        </Sidebar>
    )
}