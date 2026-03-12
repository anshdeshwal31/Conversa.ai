'use client'

import React from 'react'
import { useIntegrations } from './hooks/useIntegrations'
import SetupForm from './components/SetupForm'
import IntegrationCard from './components/IntegrationCard'

function Integrations() {

    const {
        integrations,
        loading,
        setupMode,
        setSetupMode,
        setupData,
        setSetupData,
        setupLoading,
        fetchSetupData,
        handleConnect,
        handleDisconnect,
        handleSetupSubmit
    } = useIntegrations()

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center p-6'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-4'></div>
                    <div className='text-gray-400'>Loading Integrations...</div>
                </div>
            </div>
        )
    }
    return (
        <div className='min-h-screen'>
            <div className='surface-frame max-w-[1320px] mx-auto p-6 md:p-8 ambient-panel'>
                <div className='mb-8'>
                    <span className='section-kicker'>Integrations</span>
                    <h1 className='text-2xl md:text-3xl font-semibold text-white mt-4 mb-2'>Connect Your Stack</h1>
                    <p className='text-white/60'>
                        Connect your favourite tools to automatically add action items from meetings
                    </p>
                </div>

                {setupMode && (
                    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'>
                        <div className='glass-card p-6 max-w-md w-full mx-4'>
                            <h2 className='text-lg font-semibold text-white mb-4'>
                                Setup {setupMode.charAt(0).toUpperCase() + setupMode.slice(1)}
                            </h2>

                            <SetupForm
                                platform={setupMode}
                                data={setupData}
                                onSubmit={handleSetupSubmit}
                                onCancel={() => {
                                    setSetupMode(null)
                                    setSetupData(null)
                                    window.history.replaceState({}, '', '/integrations')
                                }}
                                loading={setupLoading}
                            />
                        </div>
                    </div>
                )}

                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {integrations.map((integration) => (
                        <IntegrationCard
                            key={integration.platform}
                            integration={integration}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                            onSetup={(platform) => {
                                setSetupMode(platform)
                                fetchSetupData(platform)
                            }}
                        />
                    ))}
                </div>

                <div className='mt-8 glass-card p-6'>
                    <h3 className='font-semibold text-white mb-3'>How it works</h3>
                    <ol className='text-sm text-white/62 space-y-2.5'>
                        <li className='flex items-start gap-3'>
                            <span className='w-5 h-5 rounded-full bg-white/[0.14] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium'>1</span>
                            Connect your preferred tools above
                        </li>
                        <li className='flex items-start gap-3'>
                            <span className='w-5 h-5 rounded-full bg-white/[0.14] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium'>2</span>
                            Choose where to send action items during setup
                        </li>
                        <li className='flex items-start gap-3'>
                            <span className='w-5 h-5 rounded-full bg-white/[0.14] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium'>3</span>
                            In meetings, hover over action items and click &quot;Add to&quot;
                        </li>
                        <li className='flex items-start gap-3'>
                            <span className='w-5 h-5 rounded-full bg-white/[0.14] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium'>4</span>
                            Select which tool(s) to add the task to from the dropdown
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    )
}

export default Integrations
