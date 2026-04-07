export interface getType {
  id?: string
  skip?: number
  limit?: number
  keyword?: string
  companyId?: string
  categoryId?: string | null
}

export interface response {
  msg: string
  data: object | null
}
export interface responseController {
  status: boolean
  statusCode: number
  message: string
  data: object | null
}

export interface paginationService {
  msg: string
  skip?: number
  limit?: number
  totalData: number
  totalPages?: number
  currentPage?: number
  data: object
}

export interface paginationController {
  status: boolean
  statusCode: number
  message: string
  skip: number
  limit: number
  totalData: number
  totalPages: number
  currentPage: number
  data: object
}
export class ResponseError extends Error {
  public statusCode: number

  constructor (statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}
