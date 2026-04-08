import React from 'react'
import { ActionItem, useActionItems } from '../../hooks/useActionItems'
import { Button } from '@/components/ui/button'
import ActionItemsList from './ActionItemsList'
import AddActionItemInput from './AddActionItemInput'
import { toast } from 'sonner'

export interface ActionItemsProps {
    actionItems: ActionItem[]
    onDeleteItem: (id: number) => void
    onAddItem: (text: string) => void
    meetingId: string
}

function ActionItems({
    actionItems,
    onDeleteItem,
    onAddItem,
    meetingId
}: ActionItemsProps) {
    const {
        integrations,
        integrationsLoaded,
        loading,
        setLoading,
        showAddInput,
        setShowAddInput,
        newItemText,
        setNewItemText
    } = useActionItems(meetingId)

    const addToIntegration = async (platform: string, actionItem: ActionItem) => {
        const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)
        setLoading(prev => ({ ...prev, [`${platform}-${actionItem.id}`]: true }))
        try {
            const response = await fetch('/api/integrations/action-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform,
                    actionItem: actionItem.text,
                    meetingId
                })
            })

            const result = await response.json().catch(() => ({}))

            if (response.ok) {
                toast.success(`Added to ${platformLabel}`, {
                    description: result.message || `Action item was added to ${platformLabel} successfully.`
                })
            } else {
                toast.error(`Failed to add to ${platformLabel}`, {
                    description: result.error || `Please reconnect ${platformLabel} or verify your project/board setup in Integrations.`
                })
            }
        } catch (error) {
            console.error(`failed to add action item to ${platform}:`, error)
            toast.error(`Failed to add to ${platformLabel}`, {
                description: 'Something went wrong while adding the action item. Please try again.'
            })
        } finally {
            setLoading(prev => ({ ...prev, [`${platform}-${actionItem.id}`]: false }))
        }
    }

    const handleAddNewItem = async () => {
        if (!newItemText.trim()) {
            return
        }

        try {
            const text = newItemText.trim()
            const response = await fetch(`/api/meetings/${meetingId}/action-items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text
                })
            })

            const result = await response.json().catch(() => ({}))

            if (response.ok) {
                onAddItem(text)
                setNewItemText('')
                setShowAddInput(false)
                toast.success('Action item added', {
                    description: result.message || 'Your custom action item was added successfully.'
                })
            } else {
                toast.error('Failed to add action item', {
                    description: result.error || 'Please try again in a moment.'
                })
            }
        } catch (error) {
            console.error('failed to add action item:', error)
            toast.error('Failed to add action item', {
                description: 'Something went wrong while adding the action item. Please try again.'
            })
        }
    }

    const handleDeleteItem = async (id: number) => {
        try {
            const response = await fetch(`/api/meetings/${meetingId}/action-items/${id}`, {
                method: 'DELETE'
            })

            const result = await response.json().catch(() => ({}))

            if (response.ok) {
                onDeleteItem(id)
                toast.success('Action item deleted', {
                    description: result.message || 'The action item was removed successfully.'
                })
            } else {
                toast.error('Failed to delete action item', {
                    description: result.error || 'Please try again in a moment.'
                })
            }
        } catch (error) {
            console.error('failed to delete action item:', error)
            toast.error('Failed to delete action item', {
                description: 'Something went wrong while deleting the action item. Please try again.'
            })
        }
    }

    const hasConnectedIntegrations = integrations.length > 0

    if (!integrationsLoaded) {
        return (
            <div className='glass-card p-6 mb-8'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                    Action Items
                </h3>

                <div className='space-y-4'>
                    {actionItems.map((item) => (
                        <div key={item.id} className='group relative'>
                            <div className='flex items-center gap-3'>
                                <p className='flex-1 text-sm leading-relaxed text-gray-300'>
                                    {item.text}
                                </p>
                                <div className='animate-pulse'>
                                    <div className='h-6 w-20 bg-white/[0.06] rounded'></div>
                                </div>

                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 text-destructive rounded transition-all'
                                    disabled
                                >

                                </Button>

                            </div>
                        </div>
                    ))}

                    <div className='animate-pulse'>
                        <div className='h-8 bg-white/[0.06] rounded-lg'></div>
                    </div>

                </div>

            </div>
        )
    }

    return (
        <div className='glass-card p-6 mb-8'>
            <h3 className='text-lg font-semibold text-white mb-4'>
                Action Items
            </h3>

            <ActionItemsList
                actionItems={actionItems}
                integrations={integrations}
                loading={loading}
                addToIntegration={addToIntegration}
                handleDeleteItem={handleDeleteItem}
            />

            <AddActionItemInput
                showAddInput={showAddInput}
                setShowAddInput={setShowAddInput}
                newItemText={newItemText}
                setNewItemText={setNewItemText}
                onAddItem={handleAddNewItem}
            />

            {!hasConnectedIntegrations && actionItems.length > 0 && (
                <div className='mt-4 p-3 bg-white/[0.04] rounded-xl border border-dashed border-white/[0.1]'>
                    <p className='text-xs text-gray-500 text-center'>
                        <a href="/integrations" className='text-white/80 hover:underline'>
                            Connect Integrations
                        </a> to add action items to your tools
                    </p>
                </div>
            )}

        </div>
    )
}

export default ActionItems
