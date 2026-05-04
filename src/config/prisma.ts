import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { logger } from './logger'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' }
  ]
})

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.info(`Query: ${e.query} | Duration: ${e.duration}ms`)
  })
}

prisma.$on('error', (e) => {
  logger.error(`Prisma error: ${e.message}`)
})

export async function connectPrisma() {
  // Di Prisma v7 dengan adapter, $connect() tidak diperlukan.
  // Gunakan query ringan sebagai health check koneksi ke DB.
  await prisma.$queryRaw`SELECT 1`
  logger.info('Prisma Client is connected')
}

process.on('beforeExit', async () => {
  logger.info('Prisma Client is disconnecting')
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export const handlePrismaError = (error: any): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return 'Unique constraint failed'
      case 'P2003':
        return 'Foreign key constraint failed'
      case 'P2025':
        return 'Record not found'
      default:
        return `Prisma error: ${error.message}`
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return `Unknown error: ${error.message}`
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return `Rust panic: ${error.message}`
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return `Initialization error: ${error.message}`
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return `Validation error: ${error.message}`
  } else if (error instanceof Error) {
    return `Unexpected error: ${error.message}`
  }
  return 'An unknown error occurred'
}

export default prisma
