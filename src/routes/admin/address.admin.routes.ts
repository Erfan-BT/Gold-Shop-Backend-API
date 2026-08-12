import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminAddressController from '../../controllers/admin/address.admin.controller.js'
import { addressesQS, addressIdSchema, addressSchema } from '../../validation/address.validation.js'

const router = express.Router()

router.get('/', validate({ query : addressesQS }), adminAddressController.getAllAddresses)
router.get("/:addressId", validate({ params : addressIdSchema }), adminAddressController.getAddress)
router.patch("/:addressId", validate({ params : addressIdSchema, body : addressSchema }), adminAddressController.changeAddress)
router.delete('/:addressId', validate({ params : addressIdSchema }), adminAddressController.deleteAddress)

export default router