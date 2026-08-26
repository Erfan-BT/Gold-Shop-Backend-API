import z from "zod";
import { SettingGroup, SettingType } from "../types/setting.enum.js";

export const settingQSSchema = z.object({
    q : z.string().trim().min(1).max(100).optional(),
    group : z.array(z.enum(SettingGroup)).min(1).optional(),
    isPublic : z.coerce.boolean().optional()
})

export const settingIdSchema = z.object({
    settingId : z.coerce.number().int().positive()
})

export const createSettingSchema = z.object({
    key : z.string().trim().min(1).max(100),
    value : z.string().trim().min(1).max(300),
    type : z.enum(SettingType),
    group : z.enum(SettingGroup),
    description : z.string().trim().min(1).max(300).optional(),
    isPublic : z.coerce.boolean().default(true),
})

export const changeSettingSchema = z.object({
    key : z.string().trim().min(1).max(100).optional(),
    value : z.string().trim().min(1).max(300).optional(),
    type : z.enum(SettingType).optional(),
    group : z.enum(SettingGroup).optional(),
    description : z.string().trim().min(1).max(300).optional(),
})
.superRefine((data, ctx) => {
    if (
        data.key === undefined &&
        data.value === undefined &&
        data.type === undefined &&
        data.group === undefined &&
        data.description === undefined
    ) {
        ctx.addIssue({
            code : z.ZodIssueCode.custom,
            message : 'All Params Can Not Empty'
        })
    }
})

export type SettingQSDto = z.infer<typeof settingQSSchema>
export type SettingIdSchemaDto = z.infer<typeof settingIdSchema>
export type CreateSettingSchemaDto = z.infer<typeof createSettingSchema>
export type ChangeSettingSchemaDto = z.infer<typeof changeSettingSchema>