import constants from './constants'
import axios from 'axios'

export const fetchAxiosMidtrans = async (data: object | null, method: string, uri: string) => {
  const authHeader = Buffer.from(`${process.env.SERVER_MIDTRANS_KEY}:`).toString('base64')

  let headers
  const url = `${constants.MIDTRANS_DEV_URL}/${uri}`
  console.log(url)
  if (method === 'POST') {
    headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${authHeader}`
    }
    return axios.post(url, data, {
      headers
    })
  } else if (method === 'GET') {
    headers = {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'image/png'
    }

    return axios.get(url, {
      headers
    })
  }
}
