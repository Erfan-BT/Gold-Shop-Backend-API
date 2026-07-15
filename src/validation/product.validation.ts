import { z } from 'zod'
import { ProductKarat, ProductSort } from '../types/product.enum.js'

export const productQS = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ProductSort).optional(),

    q : z.string().max(200).optional(),

    category : z.string().max(100).optional(),
    karat : z.enum(ProductKarat).optional(),
    color : z.string().max(30).optional(),
    stone : z.string().max(50).optional(),

    minWeight : z.coerce.number().nonnegative().optional(),
    maxWeight : z.coerce.number().nonnegative().optional(),

    minPrice : z.coerce.number().nonnegative().optional(),
    maxPrice : z.coerce.number().nonnegative().optional(),

    discount : z.coerce.boolean().optional(),
    inStock : z.coerce.boolean().optional(),
})

export type ProductQSDto = z.infer<typeof productQS>