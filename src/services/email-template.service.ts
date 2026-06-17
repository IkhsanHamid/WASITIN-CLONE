import { sendEmail } from '../config/email'

const BASE_URL = process.env.FRONTEND_URL || 'https://wasitin.id'

export const sendOTPEmail = async (name: string, email: string, otp: string) => {
  const subject = 'Kode OTP Reset Password - Wasitin'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Wasitin</h1>
        </div>
        <h2 style="color: #333; text-align: center;">Reset Password</h2>
        <p style="color: #666; line-height: 1.6;">
          Halo ${name}, kami menerima permintaan untuk mereset password akun Anda.
        </p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #2563eb;">
          <p style="margin: 0; color: #666; font-size: 14px;">Kode OTP Anda:</p>
          <p style="margin: 10px 0 0 0; color: #111; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </p>
        </div>
        <p style="color: #dc2626; font-size: 14px; text-align: center;">
          ⚠️ Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.
        </p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Jika Anda tidak meminta reset password, abaikan email ini.
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} Wasitin. All rights reserved.
      </p>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

export const sendWelcomeEmail = async (name: string, email: string) => {
  const subject = 'Selamat Datang di Wasitin!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Wasitin</h1>
        </div>
        <h2 style="color: #333;">Halo ${name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Selamat! Akun Anda telah berhasil dibuat. Sekarang Anda bisa mengeksplorasi layanan Wasitin dan menemukan wasit profesional untuk berbagai olahraga.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Mulai Sekarang
          </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
          Jika Anda memiliki pertanyaan, jangan hesitate untuk menghubungi tim support kami.
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} Wasitin. All rights reserved.
      </p>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

export const sendRefereePendingVerificationEmail = async (name: string, email: string) => {
  const subject = 'Pendaftaran Wasit - Menunggu Verifikasi'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Wasitin</h1>
        </div>
        <h2 style="color: #333;">Halo ${name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Pendaftaran Anda sebagai wasit telah kami terima. Saat ini akun Anda sedang dalam proses verifikasi oleh tim kami.
        </p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">⏳ Estimasi Waktu Verifikasi: 1-3 Hari Kerja</p>
          <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
            Kami akan menginformasikan melalui email setelah proses verifikasi selesai.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Jika ada pertanyaan, hubungi kami di support@wasitin.id
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} Wasitin. All rights reserved.
      </p>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

export const sendRefereeVerifiedEmail = async (name: string, email: string, password: string) => {
  const subject = 'Selamat! Akun Wasit Anda Telah Diverifikasi'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Wasitin</h1>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 60px;">🎉</span>
        </div>
        <h2 style="color: #333; text-align: center;">Selamat ${name}!</h2>
        <p style="color: #666; line-height: 1.6; text-align: center;">
          Akun wasit Anda telah berhasil diverifikasi dan aktif.
        </p>
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #065f46; font-weight: bold; font-size: 18px;">Sekarang Anda bisa menerima pesanan wasit!</p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #9ca3af;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Password sementara Anda:</p>
          <p style="margin: 0; color: #111; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; font-family: monospace;">
            ${password}
          </p>
          <p style="margin: 15px 0 0 0; color: #dc2626; font-size: 12px;">
            ⚠️ Segera ubah password Anda setelah login untuk keamanan akun.
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/login" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Sekarang
          </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Jika ada pertanyaan, hubungi kami di support@wasitin.id
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} Wasitin. All rights reserved.
      </p>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

export const sendRefereeRejectedEmail = async (name: string, email: string, reason: string, encryptedId: string) => {
  const resetLink = `${BASE_URL}/referee/resubmit?data=${encryptedId}`
  const subject = 'Pendaftaran Wasit - Perlu Dilengkapi Ulang'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Wasitin</h1>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 60px;">📋</span>
        </div>
        <h2 style="color: #333; text-align: center;">Halo ${name}!</h2>
        <p style="color: #666; line-height: 1.6; text-align: center;">
          Mohon maaf, pendaftaran Anda sebagai wasit memerlukan perbaikan data.
        </p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">Alasan Penolakan:</p>
          <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.6;">${reason}</p>
        </div>
        <p style="color: #666; line-height: 1.6; text-align: center;">
          Silakan klik tombol di bawah untuk melengkapi data lisensi Anda.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Lengkapi Data
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; text-align: center; font-size: 14px;">
          Atau salin dan buka link berikut di browser Anda:<br>
          <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
        </p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Jika ada pertanyaan, hubungi kami di support@wasitin.id
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} Wasitin. All rights reserved.
      </p>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}
