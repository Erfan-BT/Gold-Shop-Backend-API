import { FindAndCountOptions, Transaction } from "sequelize"
import AdminAuditLog from "../models/adminAuditLog.js"
import { CreateAdminAuditLog } from "../types/adminAuditLog.type.js"

class AdminAuditLogRepository {
    async getAllAdminAudits (options : FindAndCountOptions)
    : Promise<{
        rows: AdminAuditLog[];
        count: number;
    }> {
        return await AdminAuditLog.findAndCountAll(options)
    }

    async getAdminAudit (auditId : number)
    : Promise<AdminAuditLog | null> {
        return await AdminAuditLog.findOne({
            where : {
                id : auditId
            }
        })
    }

    async createAdminAuditLog (data : CreateAdminAuditLog, transaction : Transaction | null)
    : Promise<AdminAuditLog> {
        return await AdminAuditLog.create(data, {transaction})
    }
}

export default new AdminAuditLogRepository()