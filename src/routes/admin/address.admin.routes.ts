import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminAddressController from '../../controllers/admin/address.admin.controller.js'
import { addressesQS, addressIdSchema, changeAddressSchema } from '../../validation/address.validation.js'
import { reasonSchema } from '../../validation/adminAudit.validation.js'

const router = express.Router()

router.get('/', validate({ query : addressesQS }), adminAddressController.getAllAddresses)
router.get("/:addressId", validate({ params : addressIdSchema }), adminAddressController.getAddress)
router.patch("/:addressId", validate({ params : addressIdSchema, body : changeAddressSchema }), adminAddressController.changeAddress)
router.delete('/:addressId', validate({ params : addressIdSchema, body : reasonSchema }), adminAddressController.deleteAddress)

export default router