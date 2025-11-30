// src/entities/user-address/type/user-address.ts

export enum AddressTypeEnum {
  Home = 1,
  Office = 2,
  Other = 3,
}

export enum EntityStatusEnum {
  Active = 1,
  Inactive = 2,
}

// ========== Request Types ==========
export interface UserAddressRequest {
  addressType: AddressTypeEnum
  fullName: string
  address: string
  provinceId: number
  provinceName: string
  districtId: number
  districtName: string
  wardCode: string
  wardName: string
  postalCode?: string
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
}

export interface UserAddressFilter {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  isCurrentUser?: boolean
  userId?: string
  addressType?: AddressTypeEnum
  status?: EntityStatusEnum
  provinceId?: number
  districtId?: number
  wardCode?: string
}

// ========== Response Types ==========
// UserAddressItem: For list display (has fullAddress, but not individual fields)
export interface UserAddressItem {
  id: string
  fullName: string
  address: string
  fullAddress: string
  provinceId?: number
  provinceName?: string
  districtId?: number
  districtName?: string
  wardCode?: string
  wardName?: string
  postalCode?: string
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string
}

// UserAddressDetail: For detail view/edit (has all individual fields)
export interface UserAddressDetail {
  id: string
  fullName: string
  addressType: AddressTypeEnum
  address: string
  provinceId?: number
  provinceName?: string
  districtId?: number
  districtName?: string
  wardCode?: string
  wardName?: string
  postalCode?: string
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// ========== State Types ==========
export interface UserAddressState {
  // State properties
  addresses: UserAddressItem[]
  currentAddress: UserAddressDetail | null
  isLoading: boolean
  error: string | null
  totalItems: number
  currentPage: number
  pageSize: number

  // Actions
  fetchAddresses: (filter?: UserAddressFilter) => Promise<void>
  fetchAddressById: (id: string) => Promise<UserAddressDetail | null>
  createAddress: (request: UserAddressRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  updateAddress: (id: string, request: UserAddressRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>
  setCurrentAddress: (address: UserAddressDetail | null) => void
  clearError: () => void
}

