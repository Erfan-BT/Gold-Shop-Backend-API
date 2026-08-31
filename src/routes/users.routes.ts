import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import usersController from '../controllers/users.controller.js'
import { validate } from '../middleware/validation.js'
import { changeUserInfoSchema } from '../validation/user.validation.js'
import { addressIdSchema, addressSchema, changeAddressSchema } from '../validation/address.validation.js'
import { passwordSchema } from '../validation/auth.validation.js'

const router = express.Router()

router.patch('/me', authMiddleware, validate({ body : changeUserInfoSchema }), usersController.changeUser)
router.delete('/me', authMiddleware, validate({ body : passwordSchema }), usersController.deleteUser)
// Address
router.get('/addresses', authMiddleware, usersController.getUserAddresses)
router.get('/addresses/:addressId', authMiddleware, validate({ params : addressIdSchema }), usersController.getUserAddress)
router.post('/addresses', authMiddleware, validate({ body : addressSchema }), usersController.createAddress)
router.patch('/addresses/:addressId', authMiddleware, validate({ body : changeAddressSchema , params : addressIdSchema}), usersController.changeAddress)
router.patch('/addresses/:addressId/default', authMiddleware, validate({ params : addressIdSchema}), usersController.setDefaultAddress)
router.delete('/addresses/:addressId', authMiddleware, validate({ params : addressIdSchema }), usersController.deleteAddress)

export default router