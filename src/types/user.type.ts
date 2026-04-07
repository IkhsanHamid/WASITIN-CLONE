export interface userType {
  name: string
  email: string
  photo: string | null
  googleId: string
  roleId: string
}

export type userOwner = userType & {
  sales_code: string
  phone_number: string
  company_name: string
  company_address: string
}

export interface inviteNewMember {
  username: string
  fullname: string
  email: string
  password: string
  role_id: string
  company_id: string
}
