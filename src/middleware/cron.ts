import { logger } from '../config/logger'
import { syncPendingPayments } from '../services/booking.service'

export const startCronJob = () => {
  setInterval(() => {
    syncPendingPayments().catch((err) => {
      logger.error('Cron: syncPendingPayments error = ', err)
    })
  }, 60 * 1000)

  logger.info('Cron: syncPendingPayments started (every 60s)')
}
