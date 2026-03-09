import React, { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Client } from '@/types/client.types'
import { clientsApi } from '@/services/api/clientsApi'
import toast from 'react-hot-toast'

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState({
    customerId: '',
    customerNumber: '',
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await clientsApi.getClients()
      setClients(response.data.items || [])
    } catch (error) {
      toast.error('Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClient = () => {
    setModalMode('create')
    setFormData({
      customerId: '',
      customerNumber: '',
      name: '',
      email: '',
      phone: '',
      contactPerson: '',
    })
    setIsModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setModalMode('edit')
    setSelectedClient(client)
    setFormData({
      customerId: client.customerId || '',
      customerNumber: client.customerNumber,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      contactPerson: client.contactPerson || '',
    })
    setIsModalOpen(true)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return

    try {
      await clientsApi.deleteClient(clientId)
      setClients(clients.filter(c => c.id !== clientId))
      toast.success('Client deleted successfully')
    } catch (error) {
      toast.error('Failed to delete client')
    }
  }

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create') {
        const response = await clientsApi.createClient(formData as any)
        setClients([...clients, response.data])
        toast.success('Client created successfully')
      } else {
        if (!selectedClient) return
        const response = await clientsApi.updateClient(selectedClient.id, formData as any)
        setClients(clients.map(c =>
          c.id === selectedClient.id ? response.data : c
        ))
        toast.success('Client updated successfully')
      }
      setIsModalOpen(false)
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data || error.message || `Failed to ${modalMode} client`
      toast.error(message)
      console.error(`Client ${modalMode} error:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading clients..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Client Management</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage client information and project details
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateClient}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="max-w-md">
          <Input
            placeholder="Search by name, customer number, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </Card>

      {/* Clients Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Customer #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900">{client.customerNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-error hover:text-error/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Client' : 'Edit Client'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer ID *"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              placeholder="CUST-123456"
            />
            <Input
              label="Customer Number *"
              value={formData.customerNumber}
              onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
              placeholder="CUST-001"
            />
          </div>

          <Input
            label="Client Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Corporation"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+254 700 000 000"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {modalMode === 'create' ? 'Create Client' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ClientManagement