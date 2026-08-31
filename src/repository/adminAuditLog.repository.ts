import { Transaction } from "sequelize"
import AdminAuditLog from "../models/adminAuditLog.js"
import { CreateAdminAuditLog } from "../types/adminAuditLog.type.js"

class AdminAuditLogRepository {
    async createAdminAuditLog (data : CreateAdminAuditLog, transaction : Transaction | null)
    : Promise<AdminAuditLog> {
        return await AdminAuditLog.create(data, {transaction})
    }
}

export default new AdminAuditLogRepository()