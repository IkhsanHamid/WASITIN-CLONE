const messages: Record<string, string> = {
  // ─── Generic / Server ──────────────────────────────────────
  'SERVER.ERROR': 'Terjadi kesalahan server',
  'SERVER.UNAUTHORIZED': 'Unauthorized',
  'SERVER.INVALID_ENCRYPTION_DATA': 'Data tidak valid atau telah kadaluarsa',
  'SERVER.ENCRYPTION_DATA_REQUIRED': 'Data encryption wajib diisi',

  // ─── Not Found ─────────────────────────────────────────────
  'NOT_FOUND.ENTITY': '{entity} tidak ditemukan',

  // ─── Validation ────────────────────────────────────────────
  'VALIDATION.PAGE_POSITIVE': "Parameter 'page' harus berupa angka positif",
  'VALIDATION.LIMIT_RANGE': "Parameter 'limit' harus antara 1 dan 100",
  'VALIDATION.ID_REQUIRED': 'Id tidak ditemukan',

  // ─── Auth ──────────────────────────────────────────────────
  'AUTH.FIREBASE_TOKEN_REQUIRED': 'Firebase ID Token is required',
  'AUTH.REFRESH_NOT_FOUND': 'Refresh token not found',
  'AUTH.REFRESH_INVALID': 'Invalid or expired refresh token',
  'AUTH.REFRESH_NOT_RECOGNIZED': 'Refresh token not recognized',
  'AUTH.TOKEN_REFRESHED': 'Token refreshed',
  'AUTH.LOGOUT_SUCCESS': 'Logout success',
  'AUTH.EMAIL_ALREADY_REGISTERED': 'Email sudah terdaftar',
  'AUTH.PHONE_ALREADY_REGISTERED': 'Nomor telepon sudah terdaftar',
  'AUTH.REFEREE_REGISTERED': 'Akun wasit berhasil didaftarkan',
  'AUTH.EMAIL_PASSWORD_REQUIRED': 'Email dan password wajib diisi',
  'AUTH.EMAIL_REQUIRED': 'Email wajib diisi',
  'AUTH.EMAIL_OTP_REQUIRED': 'Email dan OTP wajib diisi',
  'AUTH.EMAIL_NEW_PASSWORD_REQUIRED': 'Email dan password baru wajib diisi',
  'AUTH.PASSWORD_MIN_LENGTH': 'Password minimal 6 karakter',
  'AUTH.OTP_SENT': 'OTP berhasil dikirim ke email Anda',
  'AUTH.OTP_VERIFIED': 'OTP verifikasi berhasil',
  'AUTH.PASSWORD_RESET_SUCCESS': 'Password berhasil direset',
  'AUTH.LOGIN_SUCCESS': 'Login berhasil',
  'AUTH.INVALID_CREDENTIALS': 'Email atau password salah',
  'AUTH.ACCESS_DENIED_ADMIN_ONLY': 'Akses ditolak. Hanya Admin, SuperAdmin, dan Owner yang dapat login',
  'AUTH.ACCESS_DENIED_WRONG_ROLE': 'Akses ditolak. Gunakan login yang sesuai',
  'AUTH.ACCOUNT_DISABLED': 'Akun Anda telah dinonaktifkan',
  'AUTH.ACCOUNT_NOT_VERIFIED': 'Akun Anda belum diverifikasi. Silakan menunggu 1-3 hari kerja.',
  'AUTH.EMAIL_NOT_REGISTERED': 'Email tidak terdaftar',
  'AUTH.OTP_INVALID': 'OTP tidak valid atau sudah digunakan',
  'AUTH.OTP_EXPIRED': 'OTP sudah expired',
  'AUTH.RESET_RESTART': 'Silakan mulai proses reset password dari awal',
  'AUTH.TOKEN_SAVED': 'Token saved',
  'AUTH.LICENSE_UPDATED_PENDING_REVIEW': 'Data lisensi berhasil diperbarui, menunggu verifikasi ulang',
  'AUTH.RESUBMIT_NO_ACTIVE': 'Tidak ada permintaan resubmit yang aktif',
  'AUTH.RESUBMIT_ACTIVE': 'Permintaan resubmit sedang aktif',
  'AUTH.RESUBMIT_CHECK_ERROR': 'Terjadi kesalahan saat memeriksa status resubmit',

  // ─── Referee ───────────────────────────────────────────────
  'REFEREE.GET_SUCCESS': 'Berhasil mendapatkan data referee',
  'REFEREE.UPDATE_SUCCESS': 'Berhasil update referee',
  'REFEREE.DELETE_SUCCESS': 'Berhasil menghapus referee',
  'REFEREE.IS_VERIFIED_REQUIRED': 'is_verified wajib diisi (true/false)',
  'REFEREE.ACTIVATE_SUCCESS': 'Berhasil mengaktifkan referee',
  'REFEREE.DEACTIVATE_SUCCESS': 'Berhasil menonaktifkan referee',
  'REFEREE.NOT_FOUND': 'Referee tidak ditemukan',
  'REFEREE.DATA_NOT_FOUND': 'Data referee tidak ditemukan',
  'REFEREE.SORT_BY_INVALID': 'sort_by harus price_highest, price_lowest, rating_highest, atau review_most',

  // ─── Profile ───────────────────────────────────────────────
  'PROFILE.GET_SUCCESS': 'Berhasil mendapatkan profile',
  'PROFILE.UPDATE_SUCCESS': 'Berhasil update profile',

  // ─── Pricing ───────────────────────────────────────────────
  'PRICING.GET_SUCCESS': 'Berhasil mendapatkan pricing',
  'PRICING.UPDATE_SUCCESS': 'Berhasil update pricing',

  // ─── License ───────────────────────────────────────────────
  'LICENSE.GET_ALL_SUCCESS': 'Berhasil mendapatkan licenses',
  'LICENSE.GET_SUCCESS': 'Berhasil mendapatkan license',
  'LICENSE.DELETE_SUCCESS': 'Berhasil menghapus license',
  'LICENSE.VERIFY_SUCCESS': 'Berhasil verifikasi license',
  'LICENSE.CONFIRM_SUCCESS': 'Lisensi berhasil disetujui',
  'LICENSE.REJECT_SUCCESS': 'Lisensi berhasil ditolak, email telah dikirim',
  'LICENSE.REJECT_REASON_REQUIRED': 'Alasan penolakan wajib diisi',
  'LICENSE.NAME_REQUIRED': 'Nama lisensi wajib diisi',
  'LICENSE.LEVEL_REQUIRED': 'Level lisensi wajib diisi',
  'LICENSE.ORGANIZATION_REQUIRED': 'Organisasi wajib diisi',
  'LICENSE.NUMBER_REQUIRED': 'Nomor lisensi wajib diisi',
  'LICENSE.EXPIRED_DATE_REQUIRED': 'Tanggal kadaluarsa wajib diisi',
  'LICENSE.ISSUE_DATE_REQUIRED': 'Tanggal terbit wajib diisi',

  // ─── Availability ──────────────────────────────────────────
  'AVAILABILITY.GET_SUCCESS': 'Berhasil mendapatkan ketersediaan',
  'AVAILABILITY.REQUIRED': 'Availability wajib diisi',

  // ─── Sport (Olahraga) ──────────────────────────────────────
  'SPORT.GET_ALL_SUCCESS': 'Berhasil mengambil data olahraga',
  'SPORT.GET_SUCCESS': 'Berhasil mengambil data olahraga',
  'SPORT.CREATE_SUCCESS': 'Berhasil menambah olahraga',
  'SPORT.UPDATE_SUCCESS': 'Berhasil mengupdate olahraga',
  'SPORT.DELETE_SUCCESS': 'Berhasil menghapus olahraga',
  'SPORT.NAME_REQUIRED': 'Nama olahraga wajib diisi',
  'SPORT.ADD_SUCCESS': 'Berhasil menambah cabang olahraga',
  'SPORT.ALREADY_EXISTS': 'Cabang olahraga sudah ditambahkan',
  'SPORT.INVALID': 'Cabang olahraga tidak ditemukan',
  'SPORT.FIELD_REQUIRED': 'Cabang olahraga wajib diisi',

  // ─── Referee Sport ────────────────────────────────────────
  'REFEREE_SPORT.GET_ALL_SUCCESS': 'Berhasil mengambil data cabang olahraga referee',

  // ─── Bank ──────────────────────────────────────────────────
  'BANK.GET_ALL_SUCCESS': 'Berhasil mengambil data bank',
  'BANK.GET_SUCCESS': 'Berhasil mengambil data bank',
  'BANK.CREATE_SUCCESS': 'Berhasil menambah bank',
  'BANK.UPDATE_SUCCESS': 'Berhasil mengupdate bank',
  'BANK.DELETE_SUCCESS': 'Berhasil menghapus bank',
  'BANK.NAME_REQUIRED': 'Nama bank wajib diisi',
  'BANK.CODE_REQUIRED': 'Kode bank wajib diisi',

  // ─── Referee Bank ────────────────────────────────────────
  'REFEREE_BANK.CREATE_SUCCESS': 'Berhasil menambah rekening',
  'REFEREE_BANK.UPDATE_SUCCESS': 'Berhasil update rekening',
  'REFEREE_BANK.DELETE_SUCCESS': 'Berhasil menghapus rekening',
  'REFEREE_BANK.GET_ALL_SUCCESS': 'Berhasil mengambil data rekening',
  'REFEREE_BANK.NOT_FOUND': 'Rekening tidak ditemukan',
  'REFEREE_BANK.CONFIRM_SUCCESS': 'Rekening berhasil diverifikasi',
  'REFEREE_BANK.REJECT_SUCCESS': 'Rekening ditolak, email telah dikirim',
  'REFEREE_BANK.CODE_REQUIRED': 'Kode bank wajib diisi',
  'REFEREE_BANK.NUMBER_REQUIRED': 'Nomor rekening wajib diisi',
  'REFEREE_BANK.NAME_REQUIRED': 'Nama pemilik rekening wajib diisi',
  'REFEREE_BANK.MIN_ONE_FIELD': 'Minimal satu field harus diisi',
  'REFEREE_BANK.REJECT_REASON_REQUIRED': 'Alasan penolakan wajib diisi',
  'REFEREE_BANK.RESUBMIT_SUCCESS': 'Data rekening berhasil dikirim ulang, menunggu verifikasi',

  // ─── Voucher ───────────────────────────────────────────────
  'VOUCHER.GET_ALL_SUCCESS': 'Berhasil mengambil data voucher',
  'VOUCHER.GET_SUCCESS': 'Berhasil mengambil data voucher',
  'VOUCHER.CREATE_SUCCESS': 'Berhasil menambah voucher',
  'VOUCHER.UPDATE_SUCCESS': 'Berhasil mengupdate voucher',
  'VOUCHER.DELETE_SUCCESS': 'Berhasil menghapus voucher',

  // ─── Service Fee ─────────────────────────────────────────
  'SERVICE_FEE.GET_ALL_SUCCESS': 'Berhasil mengambil data biaya layanan',
  'SERVICE_FEE.GET_SUCCESS': 'Berhasil mengambil data biaya layanan',
  'SERVICE_FEE.CREATE_SUCCESS': 'Berhasil menambah biaya layanan',
  'SERVICE_FEE.UPDATE_SUCCESS': 'Berhasil mengupdate biaya layanan',
  'SERVICE_FEE.DELETE_SUCCESS': 'Berhasil menghapus biaya layanan',
  'SERVICE_FEE.ACTIVATE_SUCCESS': 'Biaya layanan berhasil diaktifkan',
  'SERVICE_FEE.NAME_REQUIRED': 'Nama biaya layanan wajib diisi',
  'SERVICE_FEE.PERCENTAGE_REQUIRED': 'Persentase wajib diisi dan harus angka positif',
  'VOUCHER.NAME_REQUIRED': 'Nama voucher wajib diisi',
  'VOUCHER.NAME_INVALID': 'Nama voucher tidak valid',
  'VOUCHER.TYPE_REQUIRED': 'Tipe voucher wajib diisi',
  'VOUCHER.TYPE_INVALID': 'Tipe voucher tidak valid',
  'VOUCHER.AMOUNT_REQUIRED': 'Jumlah voucher wajib diisi dan harus angka positif',
  'VOUCHER.AMOUNT_INVALID': 'Jumlah voucher harus angka positif',

  // ─── Region ────────────────────────────────────────────────
  'REGION.PROVINCE_GET_ALL_SUCCESS': 'Berhasil mengambil data provinsi',
  'REGION.PROVINCE_GET_SUCCESS': 'Berhasil mengambil data provinsi',
  'REGION.CITY_GET_ALL_SUCCESS': 'Berhasil mengambil data kota/kabupaten',
  'REGION.CITY_GET_SUCCESS': 'Berhasil mengambil data kota/kabupaten',
  'REGION.CITY_GET_BY_PROVINCE': 'Berhasil mengambil data kota/kabupaten provinsi {name}',
  'REGION.TYPE_INVALID': "Parameter 'type' harus KABUPATEN atau KOTA",

  // ─── User ──────────────────────────────────────────────────
  'USER.UPDATE_SUCCESS': 'Berhasil update data',

  // ─── Booking ───────────────────────────────────────────
  'BOOKING.CREATE_SUCCESS': 'Booking berhasil dibuat',
  'BOOKING.PAYLOAD_REQUIRED': 'Payload diperlukan',
  'BOOKING.PAYLOAD_INVALID': 'Payload tidak valid',
  'BOOKING.SCHEDULE_NOT_FOUND': 'Jadwal tidak ditemukan',
  'BOOKING.SCHEDULE_BOOKED': 'Jadwal sudah dibooking',
  'BOOKING.USER_NOT_FOUND': 'User tidak ditemukan',
  'BOOKING.MIDTRANS_LOGS_SUCCESS': 'Berhasil mengambil data midtrans logs',

  // ─── Generic Success ───────────────────────────────────────
  SUCCESS: 'Success'
}

export default messages
