/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Application, type Router } from 'express'
import { authRouter } from './auth.routes'
import { userRouter } from './user.routes'
import { regionRouter } from './region.routes'
import { masterRouter } from './master.routes'
import { refereeRouter } from './referee.routes'

const _routes: Array<[string, Router]> = [
  ['/api/v1/auth', authRouter],
  ['/api/v1/users', userRouter],
  ['/api/v1/region', regionRouter],
  ['/api/v1/master', masterRouter],
  ['/api/v1/referee', refereeRouter],
  ['/api/v1/admin/referees', refereeRouter]
]

export const routes = (app: Application) => {
  _routes.forEach((route) => {
    const [url, router] = route
    app.use(url, router)
  })
}
