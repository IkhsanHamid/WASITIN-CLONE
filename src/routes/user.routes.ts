import { Router } from 'express'
// import { addStaff, getAllUsers, getUserController, updateUserData } from '../controllers/user.controller'
import { requireUser } from '../middleware/auth'
import { updateUserData } from '../controllers/user.controller'

export const userRouter: Router = Router()

// userRouter.get('/findUser', requireUser, getUserController)
// userRouter.get('/allUsers', requireUser, getAllUsers)
userRouter.put('/update/:id', requireUser, updateUserData)
// userRouter.post('/addStaff', requireUser, addStaff)
