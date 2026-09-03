import z from "zod";
import { CategorySort } from "../types/category.enum.js";

export const categoryQS = z.object({
    page : z.coerce.number().int().min(1).default(1),
    limit : z.coerce.number().int().min(1).max(50).default(20),
    sort : z.enum(CategorySort).default(CategorySort.NEWEST),

    q : z.string().trim().max(200).optional(),
    parentId : z.coerce.number().int().min(1).optional(),

    from : z.coerce.date().optional(),
    to : z.coerce.date().optional(),

    isActive : z.coerce.boolean().optional(),
    isRoot : z.coerce.boolean().optional(),
})
.superRefine((data, ctx) => {
    if (data.isRoot === true && data.parentId !== undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["parentId"],
            message: "parentId Can Not Be Used When isRoot Is True"
        });
    }

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

export const categorySchema = z.object({
    title : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters'),
    slug : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters'),
    parentId : z.coerce.number().int().positive().nullable().optional()
})

export const changeCategorySchema = z.object({
    title : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters').optional(),
    slug : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters').optional(),
    parentId : z.coerce.number().int().positive().nullable().optional()
})

export const categoryIdSchema = z.object({
    categoryId : z.coerce.number().int().positive()
})

export const productCategoryIdsSchema = z.object({
    productId : z.coerce.number().int().positive(),
    categoryId : z.coerce.number().int().positive(),
})

export type CategoryQSDto = z.infer<typeof categoryQS>
export type CategoryDto = z.infer<typeof categorySchema>
export type ChangeCategoryDto = z.infer<typeof changeCategorySchema>
export type CategoryIdDto = z.infer<typeof categoryIdSchema>
export type ProductCategoryIdsDto = z.infer<typeof productCategoryIdsSchema>