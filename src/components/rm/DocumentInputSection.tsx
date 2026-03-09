import React from 'react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

interface Props {
  newDocName: string
  setNewDocName: (value: string) => void
  handleAddNewDocument: () => void
}

export const DocumentInputSection: React.FC<Props> = ({
  newDocName,
  setNewDocName,
  handleAddNewDocument,
}) => {
  return (
    <div className="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
      <h4 className="text-sm font-semibold text-secondary-800 mb-3">Add Additional Document</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Document Name"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          placeholder="Enter document name"
        />
        <div className="flex items-end">
          <Button type="button" onClick={handleAddNewDocument} fullWidth>
            Add Document
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentInputSection
