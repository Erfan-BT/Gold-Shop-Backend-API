import { z } from 'zod'

export const changeUserInfoSchema = z.object({
    name: z.string().trim().min(3, 'At Least 3 Characters Are Required').max(100),
    phone: z.string().regex(/^(\+989|989|09|9)\d{9}$/, 'Invalid Phone'),
})

export type ChangeUserDto = z.infer<typeof changeUserInfoSchema>