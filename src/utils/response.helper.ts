import { Response } from 'express'
import { PaginationMeta } from '../types/region.type'

// ─── Response Shapes ──────────────────────────────────────────────────────────

interface SuccessResponse<T> {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

interface ErrorResponse {
  success: false
  message: string
  errors?: unknown
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const body: SuccessResponse<T> = { success: true, message, data }
  if (meta) body.meta = meta
  return res.status(statusCode).json(body)
}

export const sendError = (res: Response, message: string, statusCode = 500, errors?: unknown): Response => {
  const body: ErrorResponse = { success: false, message }
  if (errors !== undefined) body.errors = errors
  return res.status(statusCode).json(body)
}

export const sendNotFound = (res: Response, entity = 'Data'): Response =>
  sendError(res, `${entity} tidak ditemukan`, 404)

export const sendBadRequest = (res: Response, message: string, errors?: unknown): Response =>
  sendError(res, message, 400, errors)
