import { z } from 'zod'
import { UserSort } from '../types/user.enum.js';

export const userIdSchema = z.object({
    userId : z.coerce.number().int()
})

export const changeUserInfoSchema = z.object({
    name: z.string().trim().min(3, 'At Least 3 Characters Are Required').max(100),
    phone: z.string().regex(/^(\+989|989|09|9)\d{9}$/, 'Invalid Phone'),
})

export const usersQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(UserSort).default(UserSort.NEWEST),

    q : z.string().max(200).optional(),

    roles : z.array(z.enum(['Owner', 'Admin', 'User'])).optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    isActive : z.coerce.boolean().optional(),
    isEmailVerified : z.coerce.boolean().optional()
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