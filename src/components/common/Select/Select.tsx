import React, { forwardRef } from 'react'

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    helperText?: string
    options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            className = '',
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-secondary-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            transition-all duration-200 bg-white
            ${error
                            ? 'border-error focus:ring-error/20'
                            : 'border-secondary-300 focus:ring-primary-500 focus:border-transparent'
                        }
            ${className}
          `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p id={`${selectId}-error`} className="mt-1 text-sm text-error">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${selectId}-helper`} className="mt-1 text-sm text-secondary-500">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'
