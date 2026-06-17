import { type Request, type Response, type NextFunction } from 'express'
import { resolveLocale, runWithLocale } from '../i18n'

const localeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const locale =
    (req.query.lang as string) ??
    req.headers['accept-language'] ??
    undefined

  const resolved = resolveLocale(locale)

  runWithLocale(resolved, () => {
    next()
  })
}

export default localeMiddleware
