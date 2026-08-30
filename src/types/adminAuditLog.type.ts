import { AdminAuditAction, AdminAuditEntity } from "./adminAuditLog.enum.js"

export type CreateAdminAuditLog = {
    adminId : number,
    action : AdminAuditAction,
    entityType : AdminAuditEntity,
    entityId : number | null,
    oldValues : Record<string, unknown> | null,
    newValues : Record<string, unknown> | null,
    reason : string | null,
    ipAddress : string | null
}