import React from 'react'
import { Integration } from '../hooks/useIntegrations'
import Image from 'next/image'
import { Check, ExternalLink, Settings } from 'lucide-react'

interface IntegrationCardProps {
    integration: Integration
    onConnect: (platform: string) => void
    onDisconnect: (platform: string) => void
    onSetup: (platform: string) => void
}


function IntegrationCard({
    integration,
    onConnect,
    onDisconnect,
    onSetup
}: IntegrationCardProps) {
    return (
        <div className='glass-card-hover p-6'>
            <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 relative flex-shrink-0'>
                        <Image
                            src={integration.logo}
                            alt={`${integration.name} logo`}
                            fill
                            className='object-contain rounded'
                        />
                    </div>
                    <div>
                        <h3 className='font-semibold text-white'>{integration.name}</h3>
                        {integration.connected && (
                            <span className='text-xs bg-white/[0.1] text-white/80 border border-white/[0.15] px-2 py-0.5 rounded-full'>
                                Connected
                            </span>
                        )}
                    </div>
                </div>
                {integration.connected && (
                    <div className='w-6 h-6 rounded-full bg-white/[0.1] flex items-center justify-center'>
                        <Check className='h-3.5 w-3.5 text-white/85' />
                    </div>
                )}
            </div>
            <p className='text-sm text-gray-400 mb-4'>
                {integration.description}
            </p>

            {integration.connected && integration.platform !== 'google-calendar' && (integration.boardName || integration.projectName || integration.channelName) && (
                <div className='mb-4 p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl'>
                    <div className='text-xs text-gray-500 mb-1'>Destination:</div>
                    <div className='text-sm font-medium text-white'>
                        {integration.platform === 'slack' && integration.channelName && `#${integration.channelName}`}
                        {integration.platform === 'trello' && integration.boardName}
                        {integration.platform === 'jira' && integration.projectName}
                        {integration.platform === 'asana' && integration.projectName}
                    </div>
                </div>
            )}

            {integration.connected && integration.platform === 'google-calendar' && (
                <div className='mb-4 p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl'>
                    <div className='text-xs text-gray-500 mb-1'>Status:</div>
                    <div className='text-sm font-medium text-white'>
                        Lambda auto-sync enabled
                    </div>
                </div>
            )}

            <div className='flex gap-2'>
                {integration.connected ? (
                    integration.platform === 'google-calendar' ? (
                        <button
                            onClick={() => onDisconnect(integration.platform)}
                            className='flex-1 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.1] transition-colors cursor-pointer'
                            type='button'
                        >
                            Disconnect
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onDisconnect(integration.platform)}
                                className='flex-1 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.1] transition-colors cursor-pointer'
                                type='button'
                            >
                                Disconnect
                            </button>
                            <button
                                onClick={() => onSetup(integration.platform)}
                                className='px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:bg-white/[0.1] transition-colors cursor-pointer'
                                type='button'
                            >
                                <Settings className='h-4 w-4' />
                            </button>
                        </>
                    )
                ) : (
                    <button
                        onClick={() => onConnect(integration.platform)}
                        className='flex-1 bg-white text-black py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:opacity-90'
                        type='button'
                    >
                        Connect
                        <ExternalLink className='h-4 w-4' />
                    </button>
                )}
            </div>

        </div>
    )
}

export default IntegrationCard
