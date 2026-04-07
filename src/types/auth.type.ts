export interface AuthType {
  access_token: string
  // refresh_token: string
  user_id: string
  is_login: boolean
  is_web?: boolean
  is_mobile?: boolean
}

export interface SessionType {
  accessToken: string
  username: string
  user_id: string
}

export interface ResponseWithCompanyId {
  accessToken: string
  // refreshToken: string
  // company_id?: string
}
