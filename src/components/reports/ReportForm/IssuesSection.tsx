import React from 'react'
import { Issue } from '@/types/report.types'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'

interface IssuesSectionProps {
    issues: Omit<Issue, 'id'>[]
    onChange: (issues: Omit<Issue, 'id'>[]) => void
}

const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
]

const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
]

export const IssuesSection: React.FC<IssuesSectionProps> = ({
    issues,
    onChange,
}) => {
    const addIssue = () => {
        onChange([
            ...issues,
            {
                title: '',
                description: '',
                severity: 'low',
                status: 'open',
            },
        ])
    }

    const updateIssue = (index: number, field: keyof Omit<Issue, 'id'>, value: any) => {
        const updated = [...issues]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const removeIssue = (index: number) => {
        onChange(issues.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {issues.map((issue, index) => (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg space-y-4 bg-secondary-50/30">
                    <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-secondary-900">Issue #{index + 1}</h4>
                        <button
                            type="button"
                            onClick={() => removeIssue(index)}
                            className="text-error hover:text-error-600 p-1"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Issue Title"
                            value={issue.title}
                            onChange={(e) => updateIssue(index, 'title', e.target.value)}
                            placeholder="Brief title of the issue"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Severity"
                                value={issue.severity}
                                options={severityOptions}
                                onChange={(e) => updateIssue(index, 'severity', e.target.value)}
                            />
                            <Select
                                label="Status"
                                value={issue.status}
                                options={statusOptions}
                                onChange={(e) => updateIssue(index, 'status', e.target.value)}
                            />
                        </div>
                    </div>

                    <Input
                        label="Detailed Description"
                        value={issue.description}
                        onChange={(e) => updateIssue(index, 'description', e.target.value)}
                        placeholder="Describe the issue in detail"
                    />
                </div>
            ))}

            {issues.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-secondary-200 rounded-lg">
                    <p className="text-sm text-secondary-500 italic">No issues recorded for this visit.</p>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={addIssue}
                className="w-full justify-center"
                leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
            >
                Record New Issue
            </Button>
        </div>
    )
}
