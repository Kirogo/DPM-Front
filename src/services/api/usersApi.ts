import axiosInstance from './axiosConfig'
import { baseApi } from './baseApi'
import { User, RegisterDto } from '@/types/auth.types'

export const usersApiSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => 'users',
            providesTags: ['User'],
        }),
        createUser: builder.mutation<User, RegisterDto>({
            query: (payload) => ({
                url: 'users',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation<User, { id: string; payload: Partial<User> }>({
            query: ({ id, payload }) => ({
                url: `users/${id}`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
    overrideExisting: true,
})

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice

export const usersApi = {
    // Get all users
    getUsers: async () => {
        const response = await axiosInstance.get<User[]>('/users')
        return response
    },

    // Create a new user
    createUser: async (data: RegisterDto) => {
        const response = await axiosInstance.post<User>('/users', data)
        return response
    },

    // Update a user (using the same DTO for simplicity for now)
    updateUser: async (id: string, data: Partial<User>) => {
        const response = await axiosInstance.patch<User>(`/users/${id}`, data)
        return response
    },

    // Delete a user
    deleteUser: async (id: string) => {
        const response = await axiosInstance.delete(`/users/${id}`)
        return response
    }
}
