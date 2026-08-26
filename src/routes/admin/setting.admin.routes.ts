import express from 'express'
import adminSettingController from '../../controllers/admin/setting.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { changeSettingSchema, createSettingSchema, settingIdSchema, settingQSSchema } from '../../validation/setting.validation.js'

const router = express.Router()

router.get('/', validate({ query : settingQSSchema }), adminSettingController.getAllSettings)
router.post('/', validate({ body : createSettingSchema }), adminSettingController.createSetting)
router.patch('/:settingId', validate({ params : settingIdSchema, body : changeSettingSchema }), adminSettingController.changeSetting)
router.patch('/:settingId/status', validate({ params : settingIdSchema }), adminSettingController.changeSettingStatus)
router.delete('/:settingId', validate({ params : settingIdSchema }), adminSettingController.deleteSetting)

export default router