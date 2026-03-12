import { Bot, Calendar, Mail, MessageSquare, Share2, Slack } from 'lucide-react'
import React from 'react'

const features = [
    {
        icon: Bot,
        title: "AI Meeting Summaries",
        description: "Automatic meeting summaries and action items after each meeting",
    },
    {
        icon: Calendar,
        title: "Smart Calendar Integration",
        description: "Connect Google Calendar and bots automatically join meetings",
    },
    {
        icon: Mail,
        title: "Automated Email Reports",
        description: "Receive beautiful email summaries with action items",
    },
    {
        icon: MessageSquare,
        title: "Chat with Meetings",
        description: "Ask questions about meetings using our RAG pipeline",
    },
    {
        icon: Share2,
        title: "One-Click Integrations",
        description: "Push action items to Slack, Asana, Jira and Trello",
    },
    {
        icon: Slack,
        title: "Slack bot Integration",
        description: "Install our Slack Bot to ask questions and share insights",
    },
]

function FeaturesSection() {
    return (
        <section className='px-1 py-4 md:px-2' id='features'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='mb-12 md:mb-14'>
                    <span className='section-kicker'>Platform Capabilities</span>
                    <h2 className='text-3xl md:text-5xl font-semibold text-white mt-5 mb-4 max-w-3xl'>
                        Familiar Git-style execution.
                        <span className='accent-text ml-2'>Purpose-built for meetings.</span>
                    </h2>
                    <p className='text-base md:text-lg max-w-2xl text-white/60'>
                        Structured flows for summaries, decisions, tasks, and integrations. Every block is designed to turn conversation into execution.
                    </p>
                </div>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`glass-card-hover p-6 md:p-7 ${index === 0 ? 'md:col-span-2 md:min-h-[250px]' : ''}`}
                        >
                            <div className='w-12 h-12 rounded-xl bg-[#22131d] border border-primary/20 flex items-center justify-center mb-4'>
                                <feature.icon className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='text-xl font-semibold text-white mb-2 leading-tight'>
                                {feature.title}
                            </h3>
                            <p className='text-white/60 leading-relaxed'>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
