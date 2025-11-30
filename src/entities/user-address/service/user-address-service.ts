// src/entities/user-address/service/user-address-service.ts

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  UserAddressState,
  UserAddressRequest,
  UserAddressFilter,
  UserAddressItem,
  UserAddressDetail,
} from "../type/user-address"

// Initial state
const initialState = {
  addresses: [],
  currentAddress: null,
  isLoading: false,
  error: null,
  totalItems: 0,
  currentPage: 1,
  pageSize: 10,
}

// Create Zustand Store
export const useUserAddressStore = create<UserAddressState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Fetch all addresses with pagination
      fetchAddresses: async (filter?: UserAddressFilter) => {
        try {
          set({ isLoading: true, error: null })

          const params = {
            page: filter?.page || 1,
            pageSize: filter?.pageSize || 10,
            search: filter?.search,
            sortBy: filter?.sortBy,
            isAscending: filter?.isAscending,
            isCurrentUser: filter?.isCurrentUser !== undefined ? filter.isCurrentUser : true,
            userId: filter?.userId,
            addressType: filter?.addressType,
            status: filter?.status,
            provinceId: filter?.provinceId,
            districtId: filter?.districtId,
            wardCode: filter?.wardCode,
          }

          const result = await apiClient.paginate<UserAddressItem>(
            env.ENDPOINTS.USER_ADDRESS.BASE,
            params
          )

          if (result.isSuccess) {
            set({
              addresses: result.items || [],
              totalItems: result.totalItems || 0,
              currentPage: result.currentPage || 1,
              pageSize: result.pageSize || 10,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.errors?.[0] || "Failed to fetch addresses",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Fetch address by ID
      fetchAddressById: async (id: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.get<UserAddressDetail>(`${env.ENDPOINTS.USER_ADDRESS.BASE}/${id}`)

          set({ isLoading: false })

          if (result.isSuccess && result.data) {
            set({ currentAddress: result.data })
            return result.data
          } else {
            set({ error: result.message || "Failed to fetch address" })
            return null
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
          return null
        }
      },

      // Create new address
      createAddress: async (request: UserAddressRequest) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.post(env.ENDPOINTS.USER_ADDRESS.BASE, request)

          set({ isLoading: false })

          if (result.isSuccess) {
            return { success: true }
          } else {
            set({ error: result.message || "Failed to create address" })
            return {
              success: false,
              error: result.message || "Failed to create address",
              errors: result.errors || [],
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage, errors: [errorMessage] }
        }
      },

      // Update address
      updateAddress: async (id: string, request: UserAddressRequest) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.put(`${env.ENDPOINTS.USER_ADDRESS.BASE}/${id}`, request)

          set({ isLoading: false })

          if (result.isSuccess) {
            return { success: true }
          } else {
            set({ error: result.message || "Failed to update address" })
            return {
              success: false,
              error: result.message || "Failed to update address",
              errors: result.errors || [],
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage, errors: [errorMessage] }
        }
      },

      // Delete address
      deleteAddress: async (id: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.delete(`${env.ENDPOINTS.USER_ADDRESS.BASE}/${id}`)

          set({ isLoading: false })

          if (result.isSuccess) {
            return { success: true }
          } else {
            set({ error: result.message || "Failed to delete address" })
            return {
              success: false,
              error: result.message || "Failed to delete address",
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Set current address
      setCurrentAddress: (address: UserAddressDetail | null) => {
        set({ currentAddress: address })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "user-address-store",
    }
  )
)

// Selector hooks
export const useUserAddresses = () => useUserAddressStore((state) => state.addresses)
export const useCurrentAddress = () => useUserAddressStore((state) => state.currentAddress)
export const useAddressLoading = () => useUserAddressStore((state) => state.isLoading)
export const useAddressError = () => useUserAddressStore((state) => state.error)

