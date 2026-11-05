const messages: Record<string, string> = {
  // ─── Generic / Server ──────────────────────────────────────
  'SERVER.ERROR': 'Server error occurred',
  'SERVER.UNAUTHORIZED': 'Unauthorized',
  'SERVER.INVALID_ENCRYPTION_DATA': 'Data is invalid or has expired',
  'SERVER.ENCRYPTION_DATA_REQUIRED': 'Encryption data is required',

  // ─── Not Found ─────────────────────────────────────────────
  'NOT_FOUND.ENTITY': '{entity} not found',

  // ─── Validation ────────────────────────────────────────────
  'VALIDATION.PAGE_POSITIVE': "Parameter 'page' must be a positive number",
  'VALIDATION.LIMIT_RANGE': "Parameter 'limit' must be between 1 and 100",
  'VALIDATION.ID_REQUIRED': 'ID is required',

  // ─── Auth ──────────────────────────────────────────────────
  'AUTH.FIREBASE_TOKEN_REQUIRED': 'Firebase ID Token is required',
  'AUTH.REFRESH_NOT_FOUND': 'Refresh token not found',
  'AUTH.REFRESH_INVALID': 'Invalid or expired refresh token',
  'AUTH.REFRESH_NOT_RECOGNIZED': 'Refresh token not recognized',
  'AUTH.TOKEN_REFRESHED': 'Token refreshed',
  'AUTH.LOGOUT_SUCCESS': 'Logout success',
  'AUTH.EMAIL_ALREADY_REGISTERED': 'Email is already registered',
  'AUTH.PHONE_ALREADY_REGISTERED': 'Phone number is already registered',
  'AUTH.REFEREE_REGISTERED': 'Referee account registered successfully',
  'AUTH.EMAIL_PASSWORD_REQUIRED': 'Email and password are required',
  'AUTH.EMAIL_REQUIRED': 'Email is required',
  'AUTH.EMAIL_OTP_REQUIRED': 'Email and OTP are required',
  'AUTH.EMAIL_NEW_PASSWORD_REQUIRED': 'Email and new password are required',
  'AUTH.PASSWORD_MIN_LENGTH': 'Password must be at least 6 characters',
  'AUTH.OTP_SENT': 'OTP has been sent to your email',
  'AUTH.OTP_VERIFIED': 'OTP verified successfully',
  'AUTH.PASSWORD_RESET_SUCCESS': 'Password has been reset successfully',
  'AUTH.LOGIN_SUCCESS': 'Login successful',
  'AUTH.INVALID_CREDENTIALS': 'Invalid email or password',
  'AUTH.ACCESS_DENIED_ADMIN_ONLY': 'Access denied. Only Admin, SuperAdmin, and Owner can login',
  'AUTH.ACCESS_DENIED_WRONG_ROLE': 'Access denied. Please use the appropriate login',
  'AUTH.ACCOUNT_DISABLED': 'Your account has been disabled',
  'AUTH.ACCOUNT_NOT_VERIFIED': 'Your account has not been verified. Please wait 1-3 business days.',
  'AUTH.EMAIL_NOT_REGISTERED': 'Email is not registered',
  'AUTH.OTP_INVALID': 'OTP is invalid or has been used',
  'AUTH.OTP_EXPIRED': 'OTP has expired',
  'AUTH.RESET_RESTART': 'Please start the password reset process from the beginning',
  'AUTH.TOKEN_SAVED': 'Token saved',
  'AUTH.LICENSE_UPDATED_PENDING_REVIEW': 'License data updated, pending re-verification',
  'AUTH.RESUBMIT_NO_ACTIVE': 'No active resubmit request',
  'AUTH.RESUBMIT_ACTIVE': 'Resubmit request is active',
  'AUTH.RESUBMIT_CHECK_ERROR': 'An error occurred while checking resubmit status',

  // ─── Referee ───────────────────────────────────────────────
  'REFEREE.GET_SUCCESS': 'Referee data retrieved successfully',
  'REFEREE.UPDATE_SUCCESS': 'Referee updated successfully',
  'REFEREE.DELETE_SUCCESS': 'Referee deleted successfully',
  'REFEREE.IS_VERIFIED_REQUIRED': 'is_verified is required (true/false)',
  'REFEREE.ACTIVATE_SUCCESS': 'Referee activated successfully',
  'REFEREE.DEACTIVATE_SUCCESS': 'Referee deactivated successfully',
  'REFEREE.NOT_FOUND': 'Referee not found',
  'REFEREE.DATA_NOT_FOUND': 'Referee data not found',
  'REFEREE.SORT_BY_INVALID': 'sort_by must be price_highest, price_lowest, rating_highest, or review_most',

  // ─── Profile ───────────────────────────────────────────────
  'PROFILE.GET_SUCCESS': 'Profile retrieved successfully',
  'PROFILE.UPDATE_SUCCESS': 'Profile updated successfully',

  // ─── Pricing ───────────────────────────────────────────────
  'PRICING.GET_SUCCESS': 'Pricing retrieved successfully',
  'PRICING.UPDATE_SUCCESS': 'Pricing updated successfully',

  // ─── License ───────────────────────────────────────────────
  'LICENSE.GET_ALL_SUCCESS': 'Licenses retrieved successfully',
  'LICENSE.GET_SUCCESS': 'License retrieved successfully',
  'LICENSE.DELETE_SUCCESS': 'License deleted successfully',
  'LICENSE.VERIFY_SUCCESS': 'License verified successfully',
  'LICENSE.CONFIRM_SUCCESS': 'License approved successfully',
  'LICENSE.REJECT_SUCCESS': 'License rejected, email has been sent',
  'LICENSE.REJECT_REASON_REQUIRED': 'Rejection reason is required',
  'LICENSE.NAME_REQUIRED': 'License name is required',
  'LICENSE.LEVEL_REQUIRED': 'License level is required',
  'LICENSE.ORGANIZATION_REQUIRED': 'Organization is required',
  'LICENSE.NUMBER_REQUIRED': 'License number is required',
  'LICENSE.EXPIRED_DATE_REQUIRED': 'Expired date is required',
  'LICENSE.ISSUE_DATE_REQUIRED': 'Date of issue is required',

  // ─── Availability ──────────────────────────────────────────
  'AVAILABILITY.GET_SUCCESS': 'Availability retrieved successfully',
  'AVAILABILITY.REQUIRED': 'Availability is required',

  // ─── Sport ─────────────────────────────────────────────────
  'SPORT.GET_ALL_SUCCESS': 'Sport data retrieved successfully',
  'SPORT.GET_SUCCESS': 'Sport data retrieved successfully',
  'SPORT.CREATE_SUCCESS': 'Sport created successfully',
  'SPORT.UPDATE_SUCCESS': 'Sport updated successfully',
  'SPORT.DELETE_SUCCESS': 'Sport deleted successfully',
  'SPORT.NAME_REQUIRED': 'Sport name is required',
  'SPORT.ADD_SUCCESS': 'Sport added successfully',
  'SPORT.ALREADY_EXISTS': 'Sport already added',
  'SPORT.INVALID': 'Sport not found',
  'SPORT.FIELD_REQUIRED': 'Sport is required',

  // ─── Referee Sport ────────────────────────────────────────
  'REFEREE_SPORT.GET_ALL_SUCCESS': 'Referee sport data retrieved successfully',

  // ─── Bank ──────────────────────────────────────────────────
  'BANK.GET_ALL_SUCCESS': 'Bank data retrieved successfully',
  'BANK.GET_SUCCESS': 'Bank data retrieved successfully',
  'BANK.CREATE_SUCCESS': 'Bank created successfully',
  'BANK.UPDATE_SUCCESS': 'Bank updated successfully',
  'BANK.DELETE_SUCCESS': 'Bank deleted successfully',
  'BANK.NAME_REQUIRED': 'Bank name is required',
  'BANK.CODE_REQUIRED': 'Bank code is required',

  // ─── Referee Bank ────────────────────────────────────────
  'REFEREE_BANK.CREATE_SUCCESS': 'Bank account added successfully',
  'REFEREE_BANK.UPDATE_SUCCESS': 'Bank account updated successfully',
  'REFEREE_BANK.DELETE_SUCCESS': 'Bank account deleted successfully',
  'REFEREE_BANK.GET_ALL_SUCCESS': 'Bank accounts retrieved successfully',
  'REFEREE_BANK.NOT_FOUND': 'Bank account not found',
  'REFEREE_BANK.CONFIRM_SUCCESS': 'Bank account verified successfully',
  'REFEREE_BANK.REJECT_SUCCESS': 'Bank account rejected, email has been sent',
  'REFEREE_BANK.CODE_REQUIRED': 'Bank code is required',
  'REFEREE_BANK.NUMBER_REQUIRED': 'Account number is required',
  'REFEREE_BANK.NAME_REQUIRED': 'Account holder name is required',
  'REFEREE_BANK.MIN_ONE_FIELD': 'At least one field is required',
  'REFEREE_BANK.REJECT_REASON_REQUIRED': 'Rejection reason is required',
  'REFEREE_BANK.RESUBMIT_SUCCESS': 'Bank data resubmitted, pending verification',

  // ─── Voucher ───────────────────────────────────────────────
  'VOUCHER.GET_ALL_SUCCESS': 'Voucher data retrieved successfully',
  'VOUCHER.GET_SUCCESS': 'Voucher data retrieved successfully',
  'VOUCHER.CREATE_SUCCESS': 'Voucher created successfully',
  'VOUCHER.UPDATE_SUCCESS': 'Voucher updated successfully',
  'VOUCHER.DELETE_SUCCESS': 'Voucher deleted successfully',

  // ─── Service Fee ─────────────────────────────────────────
  'SERVICE_FEE.GET_ALL_SUCCESS': 'Service fees retrieved successfully',
  'SERVICE_FEE.GET_SUCCESS': 'Service fee retrieved successfully',
  'SERVICE_FEE.CREATE_SUCCESS': 'Service fee created successfully',
  'SERVICE_FEE.UPDATE_SUCCESS': 'Service fee updated successfully',
  'SERVICE_FEE.DELETE_SUCCESS': 'Service fee deleted successfully',
  'SERVICE_FEE.ACTIVATE_SUCCESS': 'Service fee activated successfully',
  'SERVICE_FEE.NAME_REQUIRED': 'Service fee name is required',
  'SERVICE_FEE.PERCENTAGE_REQUIRED': 'Percentage is required and must be a positive number',
  'VOUCHER.NAME_REQUIRED': 'Voucher name is required',
  'VOUCHER.NAME_INVALID': 'Voucher name is invalid',
  'VOUCHER.TYPE_REQUIRED': 'Voucher type is required',
  'VOUCHER.TYPE_INVALID': 'Voucher type is invalid',
  'VOUCHER.AMOUNT_REQUIRED': 'Voucher amount is required and must be a positive number',
  'VOUCHER.AMOUNT_INVALID': 'Voucher amount must be a positive number',

  // ─── Region ────────────────────────────────────────────────
  'REGION.PROVINCE_GET_ALL_SUCCESS': 'Province data retrieved successfully',
  'REGION.PROVINCE_GET_SUCCESS': 'Province data retrieved successfully',
  'REGION.CITY_GET_ALL_SUCCESS': 'City data retrieved successfully',
  'REGION.CITY_GET_SUCCESS': 'City data retrieved successfully',
  'REGION.CITY_GET_BY_PROVINCE': 'City data for {name} province retrieved successfully',
  'REGION.TYPE_INVALID': "Parameter 'type' must be KABUPATEN or KOTA",

  // ─── User ──────────────────────────────────────────────────
  'USER.UPDATE_SUCCESS': 'Data updated successfully',

  // ─── Booking ───────────────────────────────────────────
  'BOOKING.CREATE_SUCCESS': 'Booking created successfully',
  'BOOKING.PAYLOAD_REQUIRED': 'Payload is required',
  'BOOKING.PAYLOAD_INVALID': 'Payload is invalid',
  'BOOKING.SCHEDULE_NOT_FOUND': 'Schedule not found',
  'BOOKING.SCHEDULE_BOOKED': 'Schedule is already booked',
  'BOOKING.USER_NOT_FOUND': 'User not found',
  'BOOKING.MIDTRANS_LOGS_SUCCESS': 'Midtrans logs retrieved successfully',

  // ─── Generic Success ───────────────────────────────────────
  SUCCESS: 'Success'
}

export default messages
