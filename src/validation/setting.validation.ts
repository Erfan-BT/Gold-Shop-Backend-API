import z from "zod";
import { SettingGroup } from "../types/setting.enum.js";

export const settingQSSchema = z.object({
    q : z.string().trim().min(1).max(100).optional(),
    group : z.array(z.enum(SettingGroup)).min(1).optional(),
    isPublic : z.coerce.boolean().optional()
})

export type SettingQSDto = z.infer<typeof settingQSSchema>