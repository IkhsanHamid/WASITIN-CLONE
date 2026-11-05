import { sendEmail } from '../config/email'

const BASE_URL = process.env.FRONTEND_URL || 'https://wasitin.id'

export const sendOTPEmail = async (name: string, email: string, otp: string) => {
  const subject = 'Kode OTP Reset Password - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Kami menerima permintaan untuk mereset password akun Anda. Berikut kode OTP Anda:</p>
    <h1>${otp}</h1>
    <p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendWelcomeEmail = async (name: string, email: string) => {
  const subject = 'Selamat Datang di Wasitin!'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Akun Anda telah berhasil dibuat. Sekarang Anda bisa mengeksplorasi layanan Wasitin dan menemukan wasit profesional untuk berbagai olahraga.</p>
    <p><a href="${BASE_URL}">Mulai Sekarang</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendRefereePendingVerificationEmail = async (name: string, email: string) => {
  const subject = 'Pendaftaran Wasit - Menunggu Verifikasi'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Pendaftaran Anda sebagai wasit telah kami terima. Saat ini akun Anda sedang dalam proses verifikasi oleh tim kami.</p>
    <p>Estimasi waktu verifikasi: 1-3 hari kerja. Kami akan menginformasikan melalui email setelah proses verifikasi selesai.</p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendRefereeVerifiedEmail = async (name: string, email: string, password: string) => {
  const subject = 'Akun Wasit Anda Telah Diverifikasi - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Akun wasit Anda telah berhasil diverifikasi dan aktif. Sekarang Anda bisa menerima pesanan wasit!</p>
    <p>Password sementara Anda: <strong>${password}</strong></p>
    <p>Segera ubah password Anda setelah login untuk keamanan akun.</p>
    <p><a href="${BASE_URL}/login">Login Sekarang</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendRefereeRejectedEmail = async (name: string, email: string, reason: string, encryptedId: string) => {
  const resetLink = `${BASE_URL}/referee/resubmit?data=${encryptedId}`
  const subject = 'Pendaftaran Wasit - Perlu Dilengkapi Ulang'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Mohon maaf, pendaftaran Anda sebagai wasit memerlukan perbaikan data.</p>
    <p>Alasan: ${reason}</p>
    <p><a href="${resetLink}">Lengkapi Data</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendLicenseConfirmedEmail = async (name: string, email: string, licenseName: string, sportName: string) => {
  const subject = 'Lisensi Anda Telah Disetujui - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Lisensi Anda telah disetujui oleh tim kami.</p>
    <p>Lisensi: ${licenseName} — Cabang: ${sportName}</p>
    <p>Sekarang lisensi Anda sudah aktif dan dapat digunakan untuk menerima pesanan.</p>
    <p><a href="${BASE_URL}">Lihat Profil</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendLicenseRejectedEmail = async (name: string, email: string, licenseName: string, sportName: string, reason: string, encryptedId: string) => {
  const resetLink = `${BASE_URL}/referee/license/resubmit?data=${encryptedId}`
  const subject = 'Lisensi Perlu Dilengkapi Ulang - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Mohon maaf, lisensi Anda memerlukan perbaikan data.</p>
    <p>Lisensi: ${licenseName} — Cabang: ${sportName}</p>
    <p>Alasan: ${reason}</p>
    <p><a href="${resetLink}">Lengkapi Ulang</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendBankConfirmedEmail = async (name: string, email: string, bankCode: string, accountNumber: string) => {
  const subject = 'Rekening Telah Diverifikasi - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Rekening Anda telah berhasil diverifikasi oleh tim kami.</p>
    <p>Bank: ${bankCode} — Rekening: ${accountNumber}</p>
    <p>Sekarang rekening Anda sudah aktif dan dapat digunakan untuk menerima pembayaran.</p>
    <p><a href="${BASE_URL}">Lihat Profil</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendBankRejectedEmail = async (name: string, email: string, bankCode: string, accountNumber: string, reason: string) => {
  const subject = 'Rekening Perlu Dilengkapi Ulang - Wasitin'
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Mohon maaf, data rekening Anda memerlukan perbaikan.</p>
    <p>Bank: ${bankCode} — Rekening: ${accountNumber}</p>
    <p>Alasan: ${reason}</p>
    <p><a href="${BASE_URL}">Buka Aplikasi</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendBookingPaymentEmail = async (name: string, email: string, bookId: string, amount: number, paymentInfo: string) => {
  const subject = `Konfirmasi Pembayaran - Booking ${bookId}`
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Booking Anda telah dibuat dengan kode <strong>${bookId}</strong>.</p>
    <p>Total pembayaran: <strong>Rp ${amount.toLocaleString('id-ID')}</strong></p>
    ${paymentInfo ? `<p>Silakan lakukan pembayaran ke: ${paymentInfo}</p>` : ''}
    <p>Segera selesaikan pembayaran Anda sebelum waktu habis.</p>
    <p><a href="${BASE_URL}">Lihat Booking</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendBookingInvoiceEmail = async (name: string, email: string, bookId: string, amount: number) => {
  const subject = `Pembayaran Berhasil - Booking ${bookId}`
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Pembayaran untuk booking <strong>${bookId}</strong> telah berhasil.</p>
    <p>Total dibayar: <strong>Rp ${amount.toLocaleString('id-ID')}</strong></p>
    <p>Terima kasih telah menggunakan layanan Wasitin. Wasit akan segera hadir di lokasi Anda.</p>
    <p><a href="${BASE_URL}">Lihat Booking</a></p>
  `
  return sendEmail({ to: email, subject, html })
}

export const sendRefereeBookingEmail = async (name: string, email: string, bookId: string, sport: string, date: Date, startTime: Date, location: string) => {
  const dateStr = new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = new Date(startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const subject = `Jadwal Pertandingan - Booking ${bookId}`
  const html = `
    <h2>Wasitin</h2>
    <p>Halo ${name},</p>
    <p>Anda telah dipilih sebagai wasit untuk pertandingan <strong>${sport}</strong>.</p>
    <p>Kode Booking: <strong>${bookId}</strong></p>
    <p>Tanggal: ${dateStr}</p>
    <p>Jam: ${timeStr}</p>
    ${location ? `<p>Lokasi: ${location}</p>` : ''}
    <p>Catatan: Harap hadir maksimal 30 menit sebelum pertandingan dimulai.</p>
    <p><a href="${BASE_URL}">Lihat Detail</a></p>
  `
  return sendEmail({ to: email, subject, html })
}
