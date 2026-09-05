import { AdminAuditQueryBuilder } from "../../builders/auditQuary.builder.js";
import AdminAuditLog from "../../models/adminAuditLog.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { NotFoundError } from "../../utils/appError.js";
import { AdminAuditQSDto } from "../../validation/audit.validation.js";

class AdminAuditService {
    async getAllAdminAudits (qs : AdminAuditQSDto, adminId : number)
    : Promise<{
        rows: AdminAuditLog[];
        count: number;
    }> {
        // Get Admin
        const admin = await userRepository.getUser(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)

        // Check Admin Roles
        const isFinance : boolean = admin.roles?.some(role => role.role?.name === RolesTitle.FINANCE) ?? false

        // Create Options
        const options = AdminAuditQueryBuilder.build(qs, isFinance)

        // Get Admin Audits
        return await adminAuditLogRepository.getAllAdminAudits(options)
    }

    async getAdminAudit (auditId : number)
    : Promise<AdminAuditLog> {
        // Get Admin Audit
        const audit = await adminAuditLogRepository.getAdminAudit(auditId)
        if (!audit)
            throw new NotFoundError(`Admin Audit Not Found { ID : ${auditId} }`)

        return audit
    }
}

export default new AdminAuditService()