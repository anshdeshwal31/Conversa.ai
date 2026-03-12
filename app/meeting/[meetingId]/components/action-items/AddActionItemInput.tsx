import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'

interface AddActionItemInputProps {
    showAddInput: boolean
    setShowAddInput: (show: boolean) => void
    newItemText: string
    setNewItemText: (text: string) => void
    onAddItem: () => void
}

function AddActionItemInput({
    showAddInput,
    setShowAddInput,
    newItemText,
    setNewItemText,
    onAddItem
}: AddActionItemInputProps) {

    if (showAddInput) {

        return (
            <div className='flex items-center gap-2 p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl'>
                <input
                    type='text'
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder='Enter action item...'
                    className='flex-1 bg-transparent border-0 text-sm text-white placeholder:text-gray-600 focus:outline-none'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onAddItem()
                        }
                        if (e.key === 'Escape') {
                            setShowAddInput(false)
                            setNewItemText('')
                        }
                    }}
                    autoFocus
                />
                <button
                    onClick={onAddItem}
                    disabled={!newItemText.trim()}
                    className='px-3 py-1.5 bg-white text-black rounded-lg text-xs font-medium disabled:opacity-50 cursor-pointer hover:opacity-90'
                >
                    Add
                </button>
                <button
                    onClick={() => {
                        setShowAddInput(false)
                        setNewItemText('')
                    }}
                    className='px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-gray-400 text-xs hover:bg-white/[0.1] transition-colors cursor-pointer'
                >
                    Cancel
                </button>
            </div>
        )

    }
    return (
        <button
            className='flex items-center gap-3 w-full py-2 px-3 text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] rounded-xl transition-colors group cursor-pointer'
            onClick={() => setShowAddInput(true)}
        >
            <Plus className='h-4 w-4' />
            <span>Add Action Item</span>
        </button>
    )
}

export default AddActionItemInput
