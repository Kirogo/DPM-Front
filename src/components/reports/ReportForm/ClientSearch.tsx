import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { clientsApi } from '@/services/api/clientsApi'
import { Client } from '@/types/client.types'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import toast from 'react-hot-toast'

interface ClientSearchProps {
  onClientSelect: (client: Client) => void
  selectedClientId?: string
  error?: string
  minimal?: boolean
}

export const ClientSearch: React.FC<ClientSearchProps> = ({
  onClientSelect,
  minimal = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [customerResults, setCustomerResults] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCustomerLoading, setIsCustomerLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showCustomerResults, setShowCustomerResults] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)
  const debouncedCustomerNumber = useDebounce(customerNumber, 300)

  // Search by name/query
  useEffect(() => {
    const searchClients = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setClients([])
        return
      }

      setIsLoading(true)
      try {
        const response = await clientsApi.searchClients(debouncedSearch)
        setClients(response.data)
        setShowResults(true)
      } catch (error) {
        toast.error('Failed to search clients')
      } finally {
        setIsLoading(false)
      }
    }

    searchClients()
  }, [debouncedSearch])

  // Fetch/Search by customer number typeahead
  useEffect(() => {
    const fetchByCustomerNumber = async () => {
      if (!debouncedCustomerNumber || debouncedCustomerNumber.length < 1) {
        setCustomerResults([])
        return
      }

      setIsCustomerLoading(true)
      try {
        const response = await clientsApi.searchClients(debouncedCustomerNumber)
        setCustomerResults(response.data.filter(c =>
          c.customerNumber.toLowerCase().includes(debouncedCustomerNumber.toLowerCase())
        ))
        setShowCustomerResults(true)
      } catch (error) {
        // Silently fail for typeahead
      } finally {
        setIsCustomerLoading(false)
      }
    }

    fetchByCustomerNumber()
  }, [debouncedCustomerNumber])

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    onClientSelect(client)
    setShowResults(false)
    setShowCustomerResults(false)
    setSearchTerm('')
    setCustomerNumber('')
  }

  return (
    <div className="space-y-4">
      {/* Customer Number Typeahead Search */}
      <div className="relative">
        <Input
          label={minimal ? undefined : "Customer Number Search"}
          placeholder="Select Customer Number..."
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
          onFocus={() => setShowCustomerResults(true)}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* Customer Results Dropdown */}
        {showCustomerResults && (customerResults.length > 0 || isCustomerLoading) && (
          <Card className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto shadow-xl">
            {isCustomerLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {customerResults.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full text-left px-3 py-2 hover:bg-primary-50 rounded-md transition-colors border-b border-secondary-50 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-secondary-900">{client.customerNumber}</p>
                        <p className="text-xs text-secondary-600">{client.name}</p>
                      </div>
                      {client.projectName && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-800 rounded-full border border-primary-200 whitespace-nowrap">
                          {client.projectName}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {!minimal && (
        <div className="relative">
          <Input
            label="Or Search by Client Name"
            placeholder="Type at least 2 characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResults(true)}
          />

          {/* Name Search Results Dropdown */}
          {showResults && (clients.length > 0 || isLoading) && (
            <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary-100 rounded-md transition-colors"
                    >
                      <p className="font-medium text-secondary-900">{client.name}</p>
                      <p className="text-xs text-secondary-500">
                        {client.customerNumber} • {client.projectName}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Selected Client Display (Hidden in minimal mode) */}
      {!minimal && selectedClient && (
        <Card padding="sm" className="bg-primary-50 border-primary-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-primary-900">Selected Client</h4>
              <p className="text-sm text-primary-700 mt-1">{selectedClient.name}</p>
              <p className="text-xs text-primary-600 mt-1">
                {selectedClient.customerNumber} • {selectedClient.projectName}
              </p>
              {selectedClient.address && (
                <p className="text-xs text-primary-600 mt-1">{selectedClient.address}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedClient(null)}
              className="text-primary-600 hover:text-primary-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}