import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    maxVisible?: number
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 5,
}) => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const halfVisible = Math.floor(maxVisible / 2)

        let startPage = Math.max(1, currentPage - halfVisible)
        let endPage = Math.min(totalPages, currentPage + halfVisible)

        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages, maxVisible)
        }

        if (currentPage + halfVisible >= totalPages) {
            startPage = Math.max(1, totalPages - maxVisible + 1)
        }

        if (startPage > 1) {
            pages.push(1)
            if (startPage > 2) pages.push('...')
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }

        return pages
    }

    const pages = getPageNumbers()

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-secondary-500">
                            ...
                        </span>
                    )
                }

                const pageNum = page as number
                const isActive = pageNum === currentPage

                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${isActive
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                            }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {pageNum}
                    </button>
                )
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}
