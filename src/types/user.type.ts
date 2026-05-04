export interface userType {
  name: string
  email: string
  photo: string | null
  googleId: string
  roleId: string
}

export interface updateUser {
  name?: string
  email?: string
  photo?: string
  province?: string
  city?: string
  phone?: string
}
