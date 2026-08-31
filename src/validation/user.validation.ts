import { z } from 'zod'
import { UserSort } from '../types/user.enum.js';
import { normalizeIranPhone } from '../utils/normalizeIranPhone.js';
import { RolesTitle } from '../types/role.enum.js';

export const userIdSchema = z.object({
    userId : z.coerce.number().int().positive()
})

export const changeUserRolesSchema = z.object({
    userId : z.coerce.number().int().positive(),
    roleId : z.coerce.number().int().positive()
})

export const adminChangeUserInfoSchema = z.object({
    name: z.string().trim().min(3, 'At Least 3 Characters Are Required').max(100, 'Max : 100 Characters').optional(),
    phone: z.string().trim().regex(/(\+989|989|09|9)\d{9}/, 'Invalid Phone')
    .transform(normalizeIranPhone).optional()
})
.superRefine((data, ctx) => {
    if (data.name === undefined && data.phone === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export const changeUserInfoSchema = z.object({
    name: z.string().trim().min(3, 'At Least 3 Characters Are Required').max(100, 'Max : 100 Characters').optional(),
    phone: z.string().trim().regex(/(\+989|989|09|9)\d{9}/, 'Invalid Phone')
    .transform(normalizeIranPhone).optional(),
})
.superRefine((data, ctx) => {
    if (
        data.name === undefined &&
        data.phone === undefined
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At Least One Of The Fields Is Required"
        })
    }
})

export const usersQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(UserSort).default(UserSort.NEWEST),

    q : z.string().trim().max(100).optional(),

    roles : z.array(z.enum(RolesTitle)).optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    isActive : z.coerce.boolean().optional(),
    isEmailVerified : z.coerce.boolean().optional(),
    hasOrder : z.coerce.boolean().optional()
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

export type ChangeUserDto = z.infer<typeof changeUserInfoSchema>
export type UserQSDto = z.infer<typeof usersQS>
export type UserIdDto = z.infer<typeof userIdSchema>
export type ChangeUserRolesDto = z.infer<typeof changeUserRolesSchema>
export type ChangeUserInfoDto = z.infer<typeof adminChangeUserInfoSchema>