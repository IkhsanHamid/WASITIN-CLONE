import { logger } from '../config/logger'
import crypto from 'crypto-js'
import { Response } from 'express'

const SECRET_KEY = process.env.SECRET_KEY

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in the environment variables')
}

export default {
  parseBodyNumber: (body: string): number => {
    return parseInt(body, 10)
  },
  // extractInvoiceParts: (
  //   currentInvoiceNumber: string,
  //   formatInvoice: FormatInvoice
  // ): { prefix: string; body: string; suffix: string } => {
  //   const { prefixFormat, suffixFormat } = formatInvoice
  //   const prefix = prefixFormat
  //   const suffix = suffixFormat

  //   const bodyStartIndex = prefix.length
  //   const bodyEndIndex = currentInvoiceNumber.length - suffix.length

  //   const body = currentInvoiceNumber.substring(bodyStartIndex, bodyEndIndex)

  //   return { prefix, body, suffix }
  // },
  formatUnexpectedError: (error: any): { msg: string; error: string } => {
    let errorMessage: string

    if (typeof error === 'string') {
      error = error.split(': ')
      errorMessage = error[1]
    } else if (error instanceof Error) {
      errorMessage = error.message
    } else if (error.message) {
      errorMessage = error.message
    } else if (error.msg && error.error) {
      errorMessage = error.error
    } else {
      errorMessage = 'An unexpected error occurred'
    }

    return {
      msg: 'Unexpected error',
      error: errorMessage
    }
  },
  encryptWithSecret: (text: string) => {
    const bytes = crypto.AES.encrypt(text, SECRET_KEY).toString()
    return bytes
  },
  decryptWithSecret: (text: string) => {
    const bytes = crypto.AES.decrypt(text, SECRET_KEY)
    return bytes.toString(crypto.enc.Utf8)
  },
  resSuccess: (code: number, msg: string, data: any) => {
    return {
      status: true,
      code,
      message: msg,
      data
    }
  },
  resErr: (code: number, msg: string, data: any) => {
    return {
      status: false,
      code,
      message: msg,
      data
    }
  }
}
