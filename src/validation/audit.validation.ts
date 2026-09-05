import z from "zod";
import { AdminAuditAction, AdminAuditEntity, AdminAuditSort } from "../types/adminAuditLog.enum.js";

export const adminAuditQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(AdminAuditSort).default(AdminAuditSort.NEWEST),

    q : z.string().trim().max(100).optional(),
    adminId : z.array(z.coerce.number().int().positive()).min(1).optional(),

    action : z.array(z.enum(AdminAuditAction)).min(1).optional(),
    entityType : z.array(z.enum(AdminAuditEntity)).min(1).optional(),
    entityId : z.array(z.coerce.number().int().positive()).min(1).optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.from !== undefined &&
        data.to !== undefined &&
        data.from.getTime() > data.to.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["to"],
            message: "To Date Must Be Greater Than Or Equal To From Date"
        });
    }
})

export const adminAuditIdSchema = z.object({
    auditId : z.coerce.number().int().positive()
})

export type AdminAuditQSDto = z.infer<typeof adminAuditQS>
export type AdminAuditIdDto = z.infer<typeof adminAuditIdSchema>