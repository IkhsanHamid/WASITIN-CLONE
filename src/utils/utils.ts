import { logger } from '../config/logger'
import crypto from 'crypto-js'
import cryptojs from 'crypto'

const SECRET_KEY = process.env.SECRET_KEY

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in the environment variables')
}

const generateRandomPassword = (length: number = 8): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const allChars = uppercase + lowercase + numbers

  let password = ''
  password += uppercase[cryptojs.randomInt(uppercase.length)]
  password += lowercase[cryptojs.randomInt(lowercase.length)]
  password += numbers[cryptojs.randomInt(numbers.length)]

  for (let i = 3; i < length; i++) {
    password += allChars[cryptojs.randomInt(allChars.length)]
  }

  return password.split('').sort(() => 0.5 - Math.random()).join('')
}

export default {
  generateRandomPassword,
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
