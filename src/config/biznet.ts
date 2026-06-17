// config/biznet.ts
import AWS from 'aws-sdk'

export const s3 = new AWS.S3({
  endpoint: process.env.BIZNET_ENDPOINT, // https://objectstorage.jakarta.biznetgio.com
  accessKeyId: process.env.BIZNET_ACCESS_KEY,
  secretAccessKey: process.env.BIZNET_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
})
