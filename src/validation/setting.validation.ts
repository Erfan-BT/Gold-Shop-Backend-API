import z from "zod";
import { SettingGroup, SettingType } from "../types/setting.enum.js";

export const settingQSSchema = z.object({
    q : z.string().trim().min(1).max(100).optional(),
    group : z.array(z.enum(SettingGroup)).min(1).optional(),
    isPublic : z.coerce.boolean().optional()
})

export const createSettingSchema = z.object({
    key : z.string().trim().min(1).max(100),
    value : z.string().trim().min(1).max(300),
    type : z.enum(SettingType),
    group : z.enum(SettingGroup),
    description : z.string().trim().min(1).max(300).optional(),
    isPublic : z.coerce.boolean().default(true),
})

export type SettingQSDto = z.infer<typeof settingQSSchema>
export type CreateSettingSchemaDto = z.infer<typeof createSettingSchema>