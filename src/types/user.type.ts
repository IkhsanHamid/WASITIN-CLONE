export interface userType {
  name: string
  email: string
  photo: string | null
  googleId: string
  roleId: string
  phone?: string
  province?: string
  city?: string
}

export interface updateUser {
  name?: string
  email?: string
  photo?: string
  province?: string
  city?: string
  phone?: string
}

export interface refereeType {
  name: string
  email: string
  phone: string
  province: string
  city: string
  sport_id: string
  license_name: string
  license_level: string
  organization: string
  no_license: string
  expired_date: string
  date_of_issue: string
  roleId?: string
}

export interface LicenseInput {
  name: string
  licenseLevel: string
  organization: string
  noLicense: string
  expiredDate: Date
  dateOfIssue: Date
  fileLink: string
}
