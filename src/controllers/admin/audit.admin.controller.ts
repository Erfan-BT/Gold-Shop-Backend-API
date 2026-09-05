import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminAuditIdDto, AdminAuditQSDto } from "../../validation/audit.validation.js";
import adminAuditService from "../../services/admin/audit.admin.service.js";

class AdminAuditController {
    async getAllAdminAudits (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminAuditQSDto
            const adminId = req.user!.userId
            const result = await adminAuditService.getAllAdminAudits(qs, adminId)

            res.status(200).json({
                success : true,
                msg : 'All Admin Audits Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getAdminAudit (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { auditId } = req.validated.params as AdminAuditIdDto
            const result = await adminAuditService.getAdminAudit(auditId)

            res.status(200).json({
                success : true,
                msg : 'Admin Audit Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminAuditController()