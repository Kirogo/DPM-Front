export interface Client {
    id: string
    customerId: string
    customerNumber: string
    name: string
    email: string
    phone?: string
    address?: string
    contactPerson?: string
    projectName?: string
    reportCount?: number
    createdAt: string
    updatedAt: string
}

export interface CreateClientDto {
    customerId: string
    customerNumber: string
    name: string
    email: string
    phone?: string
    address?: string
    contactPerson?: string
    projectName?: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> { }
