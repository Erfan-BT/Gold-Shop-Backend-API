import z from "zod";

export const reasonSchema = z.object({
    reason : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Character')
})

export const adminChangeUserPasswordSchema = z.object({
    password: z.string().trim().min(8, 'At Least 8 Characters Are Required').max(128),
    reason : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Character')
})

export type ReasonDto = z.infer<typeof reasonSchema>
export type AdminChangeUserPasswordDto = z.infer<typeof adminChangeUserPasswordSchema>