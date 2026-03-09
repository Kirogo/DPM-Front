import React, { useMemo } from 'react'
import { Input } from '@/components/common/Input/Input'
import { Select } from '@/components/common/Select/Select'
import { loanTypeDocuments } from '@/constants/docTypes'
import toast from 'react-hot-toast'

interface DocumentInputSectionProps {
    loanType: string
    newDocName: string
    setNewDocName: (name: string) => void
    selectedCategoryName: string | null
    setSelectedCategoryName: (name: string | null) => void
    handleAddNewDocument: () => void
}

export const DocumentInputSection: React.FC<DocumentInputSectionProps> = ({
    loanType,
    newDocName,
    setNewDocName,
    selectedCategoryName,
    setSelectedCategoryName,
    handleAddNewDocument,
}) => {
    const categories = useMemo(() => {
        if (!loanType) return []

        const typesToCheck = loanType.split(',').map((t) => t.trim()).filter(Boolean)
        const allUniqueCategories = new Set<string>()

        typesToCheck.forEach((type) => {
            const exactMatch = Object.keys(loanTypeDocuments).find(
                (key) => key.toLowerCase() === type.toLowerCase()
            )

            if (exactMatch && loanTypeDocuments[exactMatch]) {
                loanTypeDocuments[exactMatch].forEach((group) => {
                    if (group.title) allUniqueCategories.add(group.title)
                })
            }
        })

        if (allUniqueCategories.size === 0 && loanType) {
            Object.values(loanTypeDocuments).forEach((catList) => {
                catList.forEach((cat) => allUniqueCategories.add(cat.title))
            })
        }

        return Array.from(allUniqueCategories).sort()
    }, [loanType])

    const handleAddClick = () => {
        if (!newDocName.trim() || !selectedCategoryName) {
            return toast.error('Enter document name and select a category')
        }
        handleAddNewDocument()
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex-1">
                <Input
                    placeholder="New Document Name"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                />
            </div>

            <div className="w-full sm:w-64">
                <Select
                    label={loanType ? "Select Category" : "Select Loan Type First"}
                    value={selectedCategoryName || ''}
                    onChange={(e) => setSelectedCategoryName(e.target.value || null)}
                    options={[
                        { value: '', label: 'Select Category' },
                        ...categories.map((title) => ({ value: title, label: title })),
                    ]}
                    disabled={!loanType}
                />
            </div>

            <button
                type="button"
                onClick={handleAddClick}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
            >
                Add Custom Doc
            </button>
        </div>
    )
}
