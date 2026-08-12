import express from 'express'
import { validate } from '../../middleware/validation.js'
import adminAddressController from '../../controllers/admin/address.admin.controller.js'
import { addressesQS, addressIdSchema } from '../../validation/address.validation.js'

const router = express.Router()

router.get('/', validate({ query : addressesQS }), adminAddressController.getAllAddresses)
router.get("/:addressId", validate({ params : addressIdSchema }), adminAddressController.getAddress)
// router.patch("/:addressId", validate({ params : , body :  }), adminAddressController.)
// router.delete('/:addressId', validate({ params :  }), adminAddressController.)

export default router