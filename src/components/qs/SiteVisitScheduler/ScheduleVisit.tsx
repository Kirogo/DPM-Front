import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Card } from '@/components/common/Card'

interface ScheduleVisitProps {
    reportId?: string
    onScheduled?: (data: any) => void
    onCancel?: () => void
}

export const ScheduleVisit: React.FC<ScheduleVisitProps> = ({ reportId, onScheduled, onCancel }) => {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        notes: '',
        type: 'routine',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onScheduled) {
            onScheduled(formData)
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Schedule Site Visit</h3>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        label="Date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                    <Input
                        type="time"
                        label="Time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                    />
                </div>

                <Select
                    label="Visit Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={[
                        { value: 'routine', label: 'Routine Inspection' },
                        { value: 'critical', label: 'Critical Assessment' },
                        { value: 'follow_up', label: 'Follow-up Visit' },
                        { value: 'completion', label: 'Final Completion' },
                    ]}
                />

                <Input
                    label="Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific instructions..."
                />

                <div className="flex justify-end space-x-3 pt-4">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" variant="primary">
                        Schedule Visit
                    </Button>
                </div>
            </form>
        </Card>
    )
}
