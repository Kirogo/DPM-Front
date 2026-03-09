import React from 'react'
import { ChecklistDocumentCategory } from '@/types/checklist.types'

interface Props {
  documents: ChecklistDocumentCategory[]
  setDocuments: React.Dispatch<React.SetStateAction<ChecklistDocumentCategory[]>>
}

export const DocumentAccordion: React.FC<Props> = ({ documents, setDocuments }) => {
  const handleDocChange = (categoryIndex: number, docIndex: number, name: string) => {
    setDocuments((prev) => {
      const next = [...prev]
      next[categoryIndex] = { ...next[categoryIndex] }
      next[categoryIndex].docList = [...next[categoryIndex].docList]
      next[categoryIndex].docList[docIndex] = { ...next[categoryIndex].docList[docIndex], name }
      return next
    })
  }

  const removeDoc = (categoryIndex: number, docIndex: number) => {
    setDocuments((prev) => {
      const next = [...prev]
      next[categoryIndex] = { ...next[categoryIndex] }
      next[categoryIndex].docList = next[categoryIndex].docList.filter((_, i) => i !== docIndex)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {documents.map((category, categoryIndex) => (
        <details key={category.category} className="border border-secondary-200 rounded-lg bg-white" open>
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-secondary-800">
            {category.category} ({category.docList.length})
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {category.docList.map((doc, docIndex) => (
              <div key={`${category.category}-${docIndex}`} className="flex items-center gap-2">
                <input
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                  value={doc.name}
                  onChange={(e) => handleDocChange(categoryIndex, docIndex, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeDoc(categoryIndex, docIndex)}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

export default DocumentAccordion
