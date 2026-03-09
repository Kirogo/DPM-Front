//src/components/rm/ChecklistFormFields.tsx
import React from 'react'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'

interface RmUser {
  id?: string
  _id?: string
  name?: string
  firstName?: string
  lastName?: string
}

interface Props {
  rms: RmUser[]
  assignedToRM: string
  setAssignedToRM: (value: string) => void
  customerId: string
  setCustomerId: (value: string) => void
  customerName: string
  setCustomerName: (value: string) => void
  customerNumber: string
  onCustomerNumberChange: (value: string) => void
  customerEmail: string
  setCustomerEmail: (value: string) => void
  isCustomerLookupLoading?: boolean
  customerLookupMessage?: string
  customerLookupError?: boolean
  projectName: string
  handleProjectNameChange: (value: string) => void
  isEditMode?: boolean
}

export const ChecklistFormFields: React.FC<Props> = ({
  rms,
  assignedToRM,
  setAssignedToRM,
  customerId,
  setCustomerId,
  customerName,
  setCustomerName,
  customerNumber,
  onCustomerNumberChange,
  customerEmail,
  setCustomerEmail,
  isCustomerLookupLoading = false,
  customerLookupMessage,
  customerLookupError = false,
  projectName,
  handleProjectNameChange,
  isEditMode = false,
}) => {
  const readOnlyInputClass = isEditMode ? 'bg-secondary-100 text-secondary-700 cursor-not-allowed' : ''

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Customer Number *"
        value={customerNumber}
        onChange={(e) => onCustomerNumberChange(e.target.value)}
        readOnly={isEditMode}
        className={readOnlyInputClass}
        error={customerLookupError ? customerLookupMessage : undefined}
        helperText={!customerLookupError ? customerLookupMessage : undefined}
        rightIcon={isCustomerLookupLoading ? <span className="text-xs">Loading...</span> : undefined}
        autoFocus
        required
      />
      <Input
        label="Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        readOnly
        className={readOnlyInputClass}
      />
      <Input
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        readOnly
        className={readOnlyInputClass}
        required
      />
      <Input
        label="Customer Email"
        type="email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        readOnly
        className={readOnlyInputClass}
      />

      <Select
        label="Assigned RM"
        value={assignedToRM}
        onChange={(e) => setAssignedToRM(e.target.value)}
        disabled={isEditMode}
        className={isEditMode ? 'bg-secondary-100 text-secondary-700 cursor-not-allowed' : ''}
        options={[
          { value: '', label: 'Select RM' },
          ...rms.map((rm) => ({
            value: rm._id || rm.id || '',
            label:
              rm.name ||
              `${rm.firstName || ''} ${rm.lastName || ''}`.trim() ||
              (rm._id || rm.id || 'Unknown RM'),
          })),
        ]}
        required
      />

      <Input
        label="Project Name"
        value={projectName}
        onChange={(e) => handleProjectNameChange(e.target.value)}
        readOnly={isEditMode}
        className={readOnlyInputClass}
        placeholder="Enter project name"
        required
      />
    </div>
  )
}

export default ChecklistFormFields
