import z from "zod";
import { SettingGroup, SettingType } from "../types/setting.enum.js";

export const settingQS = z.object({
    q : z.string().trim().min(1).max(100).optional(),
    group : z.array(z.enum(SettingGroup)).min(1).optional(),
    isPublic : z.coerce.boolean().optional()
})

export const settingIdSchema = z.object({
    settingId : z.coerce.number().int().positive()
})

export const createSettingSchema = z.object({
    key : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters'),
    value : z.string().trim().min(1, 'At Least A Character Is Required').max(300, 'Max : 300 Characters'),
    type : z.enum(SettingType),
    group : z.enum(SettingGroup),
    description : z.string().trim().min(1, 'At Least A Character Is Required').max(300, 'Max : 300 Characters').optional(),
    isPublic : z.coerce.boolean().default(true),
})

export const changeSettingSchema = z.object({
    key : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters').optional(),
    value : z.string().trim().min(1, 'At Least A Character Is Required').max(300, 'Max : 300 Characters').optional(),
    type : z.enum(SettingType).optional(),
    group : z.enum(SettingGroup).optional(),
    description : z.string().trim().min(1, 'At Least A Character Is Required').max(300, 'Max : 300 Characters').optional(),
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
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export type SettingQSDto = z.infer<typeof settingQS>
export type SettingIdDto = z.infer<typeof settingIdSchema>
export type CreateSettingDto = z.infer<typeof createSettingSchema>
export type ChangeSettingDto = z.infer<typeof changeSettingSchema>