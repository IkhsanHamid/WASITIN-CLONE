import { type Response } from 'express'
import { type PaginationMeta } from '../types/region.type'
import { t } from '../i18n'

// ─── Response Shapes ──────────────────────────────────────────────────────────

interface SuccessResponse<T> {
  status: true
  message: string
  data: T
  meta?: PaginationMeta
}

interface ErrorResponse {
  status: false
  message: string
  errors?: unknown
}

// ─── Message resolver — raw string or i18n key ────────────────────────────────

type Params = Record<string, string | number>

export function msg (key: string, params?: Params): string {
  return t(key, params)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const body: SuccessResponse<T> = { status: true, message, data }
  if (meta) body.meta = meta
  return res.status(statusCode).json(body)
}

export const sendSuccessMsg = <T>(
  res: Response,
  data: T,
  key: string,
  params?: Params,
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  return sendSuccess(res, data, t(key, params), statusCode, meta)
}

export const sendError = (res: Response, message: string, statusCode = 500, errors?: unknown): Response => {
  const body: ErrorResponse = { status: false, message }
  if (errors !== undefined) body.errors = errors
  return res.status(statusCode).json(body)
}

export const sendErrorMsg = (
  res: Response,
  key: string,
  params?: Params,
  statusCode = 500,
  errors?: unknown
): Response => {
  return sendError(res, t(key, params), statusCode, errors)
}

export const sendNotFound = (res: Response, entity = 'Data'): Response =>
  sendError(res, msg('NOT_FOUND.ENTITY', { entity }), 404)

export const sendBadRequest = (res: Response, message: string, errors?: unknown): Response =>
  sendError(res, message, 400, errors)

export const sendBadRequestMsg = (
  res: Response,
  key: string,
  params?: Params,
  errors?: unknown
): Response => {
  return sendBadRequest(res, t(key, params), errors)
}
