import { Router } from 'express'
import { delPermission, findRoles, insertPermission, updatePermission } from '../controllers/roles.controller'
import { requireUser } from '../middleware/auth'

export const rolesRouter: Router = Router()

rolesRouter.get('/getRoles', requireUser, findRoles)
rolesRouter.post('/insertPermissions', requireUser, insertPermission)
rolesRouter.put('/updatePermissions', requireUser, updatePermission)
rolesRouter.delete('/deletePermissions', requireUser, delPermission)
