import { z } from 'zod'

export const registerSchema = z.object({
    name: z.string().min(3, 'At Least 3 Characters Are Required').max(100),
    email: z.string().email('Invalid Email'),
    phone: z.string().regex(/^(\+989|989|09|9)\d{9}$/, 'Invalid Phone'),
    password: z.string().min(8, 'At Least 8 Characters Are Required'),
})

export const loginSchema = z.object({
    email: z.string().email('Invalid Email'),
    password: z.string().min(1, 'Password Is Required'),
})

export const refreshScema = z.object({
    refreshToken : z.string().min(1, 'Refresh Token Is Required')
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type RefreshDto = z.infer<typeof refreshScema>