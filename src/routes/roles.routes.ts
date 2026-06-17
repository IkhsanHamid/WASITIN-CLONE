import { Router } from 'express'
import { findRoles } from '../controllers/roles.controller'
import { requiredAdmin } from '../middleware/auth'

export const rolesRouter: Router = Router()

rolesRouter.get('/getRoles', requiredAdmin, findRoles)
