import nodemailer from 'nodemailer'
import { logger } from './logger'
import 'dotenv/config'

/**
 * Email Configuration using Brevo (Sendinblue) SMTP
 * Creates a reusable transporter instance for sending emails
 */

// Validate required environment variables
const requiredEnvVars = [
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_PORT',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASS',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`)
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

/**
 * Create Nodemailer transporter with Brevo SMTP configuration
 */
export const emailTransporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
  logger: process.env.NODE_ENV === 'development' // Enable logger in development
})

/**
 * Verify email transporter connection
 */
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('error', error)
    logger.error('Email transporter verification failed:', error)
  } else {
    logger.info('Email transporter is ready to send emails')
  }
})

/**
 * Default sender information
 */
export const emailDefaults = {
  from: {
    name: process.env.BREVO_SENDER_NAME as string,
    address: process.env.BREVO_SENDER_EMAIL as string
  }
}

/**
 * Email sending options interface
 */
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content?: string
    path?: string
  }>
}

/**
 * Send email function with error handling
 * @param options Email options
 * @returns Promise with send result
 */
export const sendEmail = async (
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: any }> => {
  try {
    const mailOptions = {
      from: `${emailDefaults.from.name} <${emailDefaults.from.address}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      attachments: options.attachments
    }

    const info = await emailTransporter.sendMail(mailOptions)

    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
      subject: options.subject
    })

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.log('error email', error)
    logger.error('Failed to send email:', {
      error: error.message,
      to: options.to,
      subject: options.subject
    })

    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Test email configuration
 * Useful for debugging email setup
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    await emailTransporter.verify()
    logger.info('Email configuration test passed')
    return true
  } catch (error: any) {
    logger.error('Email configuration test failed:', error.message)
    return false
  }
}
