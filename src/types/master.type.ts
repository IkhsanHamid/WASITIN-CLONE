export interface Sport {
  id: string
  name: string
}

export interface SportCreatePayload {
  name: string
}

export interface SportUpdatePayload {
  name?: string
}

export interface SportQueryParams {
  search?: string
  page?: number
  limit?: number
}

export interface Bank {
  id: string
  name: string
  code: string
  photo: string | null
  created_id: string
  created_at: Date
  updated_at: Date | null
}

export interface BankCreatePayload {
  name: string
  code: string
  photo?: string
}

export interface BankUpdatePayload {
  name?: string
  code?: string
  photo?: string
}

export interface BankQueryParams {
  search?: string
  page?: number
  limit?: number
}

export interface Voucher {
  id: string
  name: string
  type: string
  amount: number
  created_id: string
  updated_id: string | null
  created_at: Date
  updated_at: Date
}

export interface VoucherCreatePayload {
  name: string
  type: string
  amount: number
}

export interface VoucherUpdatePayload {
  name?: string
  type?: string
  amount?: number
}

export interface VoucherQueryParams {
  search?: string
  page?: number
  limit?: number
}

// ─── Service Fee ───────────────────────────────────────────────

export interface ServiceFee {
  id: string
  name: string
  type: string
  percentage: number | null
  amount: number | null
  type_service: string
  is_active: boolean
  created_at: Date
  updated_at: Date | null
}

export interface ServiceFeeCreatePayload {
  name: string
  type: string
  percentage?: number
  amount?: number
  type_service: string
}

export interface ServiceFeeUpdatePayload {
  name?: string
  type?: string
  percentage?: number
  amount?: number
  type_service?: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
