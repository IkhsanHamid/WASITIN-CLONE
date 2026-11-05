import { Router } from 'express'
import { requireUser, requiredAdmin } from '../middleware/auth'
import { createBookingHandler, midtransNotificationHandler, getMidtransLogsHandler, getPaymentStatusHandler } from '../controllers/booking.controller'

export const bookingRouter: Router = Router()

bookingRouter.post('/', requireUser, createBookingHandler)
bookingRouter.post('/payment/status', requireUser, getPaymentStatusHandler)
bookingRouter.post('/payment/notification', midtransNotificationHandler)

bookingRouter.get('/midtrans/logs', requiredAdmin, getMidtransLogsHandler)
