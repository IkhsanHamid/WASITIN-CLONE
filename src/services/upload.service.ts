import { s3 } from '../config/biznet'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../config/logger'

export const uploadImage = async (file: Express.Multer.File) => {
  try {
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Only image allowed')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Max 2MB')
    }

    const cleanedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${uuidv4()}-${cleanedFileName}`
    const key = `wasitin/${fileName}`

    await s3
      .putObject({
        Bucket: 'blax-storage',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // ⬅️ PENTING
        CacheControl: 'max-age=3600'
      })
      .promise()

    const publicUrl = `${process.env.BIZNET_ENDPOINT}/blax-storage/${key}`

    return publicUrl
  } catch (error) {
    logger.error('Cannot upload image', error)
    throw error
  }
}
