import React, { useState, useEffect } from 'react'
import { CreateReportDto } from '@/types/report.types'
import { ClientSearch } from './ClientSearch'
import { Input } from '@/components/common/Input/Input'
import { Select } from '@/components/common/Select/Select'
import { usersApi } from '@/services/api/usersApi'
import { User } from '@/types/auth.types'

interface ReportFormProps {
    initialData?: Partial<CreateReportDto>
    onSubmit: (data: CreateReportDto, photos: File[], isDraft?: boolean) => void | Promise<void>
    onCancel?: () => void
    isLoading?: boolean
}

export const ReportForm: React.FC<ReportFormProps> = ({
    initialData,
    onSubmit,
    isLoading = false,
}) => {
    const [formData, setFormData] = useState<Partial<CreateReportDto>>(initialData || {
        workProgress: [],
        issues: []
    })
    const [selectedClient, setSelectedClient] = useState<any>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // RM selection state
    const [rms, setRms] = useState<User[]>([])

    // Fetch RMs
    useEffect(() => {
        const fetchRms = async () => {
            try {
                const response = await usersApi.getUsers()
                setRms(response.data.filter(u => u.role?.toLowerCase() === 'rm'))
            } catch (error) {
                console.error('Failed to fetch RMs:', error)
            }
        }
        fetchRms()
    }, [])

    const handleClientSelect = (client: any) => {
        setSelectedClient(client)
        setFormData((prev) => ({
            ...prev,
            clientId: client.id,
            siteAddress: client.address || prev.siteAddress || ''
        }))
        setErrors((prev) => ({ ...prev, clientId: '' }))
    }

    const validate = (isDraft: boolean): boolean => {
        if (isDraft) return true

        const newErrors: Record<string, string> = {}

        if (!formData.clientId) newErrors.clientId = 'Client is required'
        if (!formData.rmId) newErrors.rmId = 'Assigned RM is required'
        if (!formData.projectName) newErrors.projectName = 'Project Name is required'
        if (!formData.ibpsNo) newErrors.ibpsNo = 'IBPS NO is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const onSubmitHandler = async (e: React.FormEvent, isDraft: boolean) => {
        e.preventDefault()

        if (!validate(isDraft)) {
            return
        }

        try {
            await onSubmit(formData as CreateReportDto, [], isDraft)
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    return (
        <form className="space-y-6" onSubmit={(e) => onSubmitHandler(e, false)}>
            {/* Main Inner Card */}
            <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.1)] border-t-[6px] border-transparent overflow-hidden">
                <div className="p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-[#1a365d] mb-8">Create New Site Visit Report</h2>

                    {/* Customer Selection row 1 */}
                    <div className="w-full">
                        <ClientSearch
                            selectedClientId={formData.clientId}
                            onClientSelect={handleClientSelect}
                            error={errors.clientId}
                            minimal={true}
                        />
                    </div>

                    {/* Customer Info row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            placeholder="Customer Name"
                            value={selectedClient?.name || ''}
                            readOnly
                            disabled
                            className="bg-secondary-50"
                        />
                        <Input
                            placeholder="Customer Number"
                            value={selectedClient?.customerNumber || ''}
                            readOnly
                            disabled
                            className="bg-secondary-50"
                        />
                        <Input
                            placeholder="Customer Email"
                            value={selectedClient?.email || ''}
                            readOnly
                            disabled
                            className="bg-secondary-50"
                        />
                    </div>

                    {/* RM Search row 3 */}
                    <div className="w-full">
                        <Select
                            label="Search RM..."
                            value={formData.rmId || ''}
                            onChange={(e) => setFormData({ ...formData, rmId: e.target.value })}
                            options={[
                                { value: '', label: 'Select RM' },
                                ...rms.map(rm => ({ value: rm.id, label: `${rm.firstName} ${rm.lastName}` }))
                            ]}
                            error={errors.rmId}
                        />
                    </div>

                    {/* Project Name row 4 */}
                    <div className="w-full">
                        <Input
                            label="Enter Project Name"
                            value={formData.projectName || ''}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            placeholder="Enter project name"
                            error={errors.projectName}
                        />
                    </div>

                </div>
            </div>

            {/* IBPS Section Below Card */}
            <div className="px-2 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a365d]">IBPS NO *</label>
                    <Input
                        placeholder="Enter IBPS Number"
                        value={formData.ibpsNo || ''}
                        onChange={(e) => setFormData({ ...formData, ibpsNo: e.target.value })}
                        error={errors.ibpsNo}
                    />
                </div>

                {/* Main Action Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 px-6 rounded-lg text-lg font-medium transition-all ${isLoading
                            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                            }`}
                        onClick={(e) => onSubmitHandler(e, false)}
                    >
                        {isLoading ? 'Creating...' : 'Create Site Visit Report'}
                    </button>
                    {Object.keys(errors).length > 0 && (
                        <p className="mt-4 text-center text-red-500 text-sm">
                            Please fill all required fields (Assigned RM, Loan Type, and IBPS NO)
                        </p>
                    )}
                </div>
            </div>
        </form>
    )
}
