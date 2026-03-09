import React, { useState } from 'react'
import { ReportDocumentCategory, ReportDocument } from '@/types/report.types'
import { Input } from '@/components/common/Input/Input'
import { Select } from '@/components/common/Select/Select'

interface DocumentAccordionProps {
    documents: ReportDocumentCategory[]
    setDocuments: React.Dispatch<React.SetStateAction<ReportDocumentCategory[]>>
}

const actionToStatus: Record<string, string> = {
    submitted: "submitted",
    pendingrm: "pendingrm",
    pendingco: "pendingco",
    tbo: "tbo",
    sighted: "sighted",
    waived: "waived",
    deferred: "deferred",
}

export const DocumentAccordion: React.FC<DocumentAccordionProps> = ({ documents, setDocuments }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const handleDocumentChange = (catIdx: number, docIdx: number, field: keyof ReportDocument, value: string) => {
        const updated = [...documents]
        const doc = { ...updated[catIdx].docList[docIdx] }

        // @ts-ignore
        doc[field] = value

        if (field === 'action') {
            doc.status = (actionToStatus[value] || 'pendingrm') as ReportDocument['status']
        }

        updated[catIdx].docList[docIdx] = doc
        setDocuments(updated)
    }

    const handleRemoveDocument = (catIdx: number, docIdx: number) => {
        const updated = [...documents]
        updated[catIdx].docList = updated[catIdx].docList.filter((_, i) => i !== docIdx)
        setDocuments(updated)
    }

    const handleAddDocument = (catIdx: number) => {
        const updated = [...documents]
        updated[catIdx].docList.push({
            name: '',
            status: 'pendingrm',
            action: ''
        })
        setDocuments(updated)
    }

    return (
        <div className="space-y-4">
            {documents.map((cat, catIdx) => (
                <div key={catIdx} className="border border-secondary-200 rounded-lg overflow-hidden">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                        onClick={() => setOpenIndex(openIndex === catIdx ? null : catIdx)}
                    >
                        <span className="font-semibold text-secondary-900">{cat.category}</span>
                        <svg
                            className={`h-5 w-5 transform transition-transform ${openIndex === catIdx ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openIndex === catIdx && (
                        <div className="p-4 bg-white space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-secondary-500 uppercase bg-secondary-50">
                                        <tr>
                                            <th className="px-4 py-2">Document</th>
                                            <th className="px-4 py-2">Action</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Comment</th>
                                            <th className="px-4 py-2 text-right">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100">
                                        {cat.docList.map((doc, docIdx) => (
                                            <tr key={docIdx}>
                                                <td className="px-4 py-2 min-w-[200px]">
                                                    <Input
                                                        placeholder="Document Name"
                                                        value={doc.name}
                                                        onChange={(e) => handleDocumentChange(catIdx, docIdx, 'name', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 min-w-[150px]">
                                                    <Select
                                                        value={doc.action || ''}
                                                        options={[
                                                            { value: '', label: 'Select Action' },
                                                            { value: 'submitted', label: 'Submitted' },
                                                            { value: 'pendingrm', label: 'Pending from RM' },
                                                            { value: 'pendingco', label: 'Pending from Co' },
                                                            { value: 'tbo', label: 'TBO' },
                                                            { value: 'sighted', label: 'Sighted' },
                                                            { value: 'waived', label: 'Waived' },
                                                            { value: 'deferred', label: 'Deferred' },
                                                        ]}
                                                        onChange={(e) => handleDocumentChange(catIdx, docIdx, 'action', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className="font-medium text-secondary-700">{doc.status}</span>
                                                </td>
                                                <td className="px-4 py-2 min-w-[200px]">
                                                    <Input
                                                        placeholder="Comment"
                                                        value={doc.comment || ''}
                                                        onChange={(e) => handleDocumentChange(catIdx, docIdx, 'comment', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDocument(catIdx, docIdx)}
                                                        className="text-error hover:text-error-hover p-2 transition-colors"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAddDocument(catIdx)}
                                className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Document
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
