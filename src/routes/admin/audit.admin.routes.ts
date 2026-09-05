import express from 'express'
import adminAuditController from '../../controllers/admin/audit.admin.controller.js'
import { validate } from '../../middleware/validation.js'
import { adminAuditIdSchema, adminAuditQS } from '../../validation/audit.validation.js'

const router = express.Router()

router.get('/', validate({ query : adminAuditQS }), adminAuditController.getAllAdminAudits)
router.get('/:auditId', validate({ params : adminAuditIdSchema }), adminAuditController.getAdminAudit)

export default router