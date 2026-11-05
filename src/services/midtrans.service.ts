import axios from 'axios'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''
const MIDTRANS_DEV_URL = 'https://api.sandbox.midtrans.com/v2'
const MIDTRANS_PROD_URL = 'https://api.midtrans.com/v2'

const baseUrl = process.env.NODE_ENV === 'production' ? MIDTRANS_PROD_URL : MIDTRANS_DEV_URL

const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')

export const createTransaction = async (params: {
  order_id: string
  gross_amount: number
  customer_name: string
  customer_email: string
  customer_phone?: string
}) => {
  const payload = {
    payment_type: 'qris',
    transaction_details: {
      order_id: params.order_id,
      gross_amount: params.gross_amount
    },
    customer_details: {
      first_name: params.customer_name,
      email: params.customer_email,
      phone: params.customer_phone ?? ''
    }
  }

  const response = await axios.post(`${baseUrl}/charge`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`
    }
  })

  return response.data
}

export const getTransactionStatus = async (orderId: string) => {
  const response = await axios.get(`${baseUrl}/${orderId}/status`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`
    }
  })

  return response.data
}

export const getQrCodeBase64 = async (qrUrl: string): Promise<string> => {
  const response = await axios.get(qrUrl, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: `Basic ${authHeader}`
    }
  })

  return `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`
}
