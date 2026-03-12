import Image from 'next/image'
import React from 'react'

const integrations = [
    { name: "Slack", image: "slack.png" },
    { name: "Asana", image: "asana.png" },
    { name: "Jira", image: "jira.png" },
    { name: "Trello", image: "trello.png" },
    { name: "Google Calendar", image: "gcal.png" }
]

function IntegrationsSection() {
    return (
        <section className='px-1 py-4 md:px-2' id='integrations'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-10'>
                <div className='mb-12'>
                    <span className='section-kicker'>Connect</span>
                    <h2 className='text-3xl md:text-4xl font-semibold text-white mt-5 mb-3'>
                        Click. Connect. <span className='accent-text'>Deploy context.</span>
                    </h2>
                    <p className='text-base md:text-lg text-white/60 max-w-2xl'>
                        Route action items to the systems your team already trusts without manual copy-and-paste.
                    </p>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5'>
                    {integrations.map((integration, index) => (
                        <div
                            key={index}
                            className='glass-card-hover p-4 md:p-5 text-center group cursor-pointer'
                        >
                            <div className='w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl border border-white/10 bg-[#190f18] p-3 transition-all duration-300 group-hover:scale-105'>
                                <Image
                                    src={`/${integration.image}`}
                                    alt={`${integration.name} logo`}
                                    width={64}
                                    height={64}
                                    className='w-full h-full object-contain'
                                />
                            </div>
                            <p className='text-sm font-medium text-white/80 group-hover:text-white'>{integration.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default IntegrationsSection
