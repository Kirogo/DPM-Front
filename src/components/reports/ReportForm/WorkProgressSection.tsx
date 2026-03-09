import React, { useState } from 'react'
import { WorkProgress } from '@/types/report.types'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

interface WorkProgressSectionProps {
    workProgress: Omit<WorkProgress, 'id'>[]
    onChange: (workProgress: Omit<WorkProgress, 'id'>[]) => void
}

export const WorkProgressSection: React.FC<WorkProgressSectionProps> = ({
    workProgress,
    onChange,
}) => {
    const addWorkItem = () => {
        onChange([
            ...workProgress,
            {
                description: '',
                percentage: 0,
                category: '',
                notes: '',
            },
        ])
    }

    const updateWorkItem = (index: number, field: keyof Omit<WorkProgress, 'id'>, value: any) => {
        const updated = [...workProgress]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const removeWorkItem = (index: number) => {
        onChange(workProgress.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {workProgress.map((item, index) => (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-secondary-900">Work Item {index + 1}</h4>
                        <button
                            type="button"
                            onClick={() => removeWorkItem(index)}
                            className="text-error hover:text-red-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Category"
                            type="text"
                            value={item.category}
                            onChange={(e) => updateWorkItem(index, 'category', e.target.value)}
                            placeholder="e.g., Foundation, Framing"
                        />

                        <Input
                            label="Progress (%)"
                            type="number"
                            min="0"
                            max="100"
                            value={item.percentage}
                            onChange={(e) => updateWorkItem(index, 'percentage', parseInt(e.target.value) || 0)}
                            placeholder="0-100"
                        />
                    </div>

                    <Input
                        label="Description"
                        type="text"
                        value={item.description}
                        onChange={(e) => updateWorkItem(index, 'description', e.target.value)}
                        placeholder="Describe the work progress"
                    />

                    <Input
                        label="Notes"
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateWorkItem(index, 'notes', e.target.value)}
                        placeholder="Additional notes"
                    />
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addWorkItem}
                leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            >
                Add Work Item
            </Button>
        </div>
    )
}
