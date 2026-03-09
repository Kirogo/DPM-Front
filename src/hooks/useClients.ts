//src/hooks/useClients.ts
import { useState, useCallback, useEffect } from 'react'
import { Client, CreateClientDto, UpdateClientDto } from '@/types/client.types'
import { clientsApi } from '@/services/api/clientsApi'
import toast from 'react-hot-toast'

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalCount, setTotalCount] = useState(0)

    const fetchClients = useCallback(async (params?: any) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientsApi.getClients(params)
            setClients(response.data.items)
            setTotalCount(response.data.total)
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch clients'
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const searchClients = useCallback(async (query: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientsApi.searchClients(query)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to search clients'
            setError(message)
            toast.error(message)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getClientById = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientsApi.getClientById(id)
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch client details'
            setError(message)
            toast.error(message)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const createClient = useCallback(async (data: CreateClientDto) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientsApi.createClient(data)
            toast.success('Client created successfully')
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to create client'
            setError(message)
            toast.error(message)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const updateClient = useCallback(async (id: string, data: UpdateClientDto) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await clientsApi.updateClient(id, data)
            toast.success('Client updated successfully')
            return response.data
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update client'
            setError(message)
            toast.error(message)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const deleteClient = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            await clientsApi.deleteClient(id)
            toast.success('Client deleted successfully')
            return true
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to delete client'
            setError(message)
            toast.error(message)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        clients,
        isLoading,
        error,
        totalCount,
        fetchClients,
        searchClients,
        getClientById,
        createClient,
        updateClient,
        deleteClient,
    }
}
