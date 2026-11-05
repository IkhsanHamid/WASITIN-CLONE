export interface BookingPayload {
  date: string
  start_time: string
  end_time: string
  sport: string
  location?: string
  address?: string
  longitude?: number
  latitude?: number
  link_google_maps?: string
  notes?: string
  type_match: string
  type_time: string
  referees: Array<{
    referee_id: string
    role_referee: 'MAIN_REFEREE' | 'ASSISTANT_REFEREE' | 'LINE_REFEREE_1' | 'LINE_REFEREE_2'
  }>
  voucher_code?: string
}

export interface BookingResult {
  booking_id: string
  encrypted_id: string
  payment: {
    id: string
    total_amount: number
    grand_total: number
    discount: number
    admin_fee: number
    status: string
    payment_url?: string
  }
}

export interface MidtransLogQueryParams {
  search?: string
  status?: string
  page?: number
  limit?: number
}
