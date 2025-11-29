// src/entities/payment-method/type/payment-method.ts

import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"

export interface PaymentMethodFilter {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  isOnlinePayment?: boolean
  status?: EntityStatusEnum
}

export interface PaymentMethodItem {
  id: string
  name: string
  description?: string | null
  iconPath?: string | null
  isOnlinePayment: boolean
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string | null
}

