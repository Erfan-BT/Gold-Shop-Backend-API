import z from "zod";
import { RefundStatus, ReturnItemStatus, ReturnSort, ReturnStatus } from "../types/return.enum.js";

export const returnRequestSchema = z.object({
    orderNumber : z.string().trim().min(1, 'At Least A Character Is Required').max(50, 'Max : 50 Characters'),
    items : z.array(
        z.object({
            orderItemId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive(),
            reason: z.string().trim().min(3, 'At Least 3 Characters Are Required').max(50, 'Max : 50 Characters'),
            description: z.string().trim().max(500, 'Max : 500 characters').optional(),
        })
    )
    .min(1, 'At Least One Item Is Required')
    .superRefine((items, ctx) => {
        const ids = new Set<number>();

        for (const [index, item] of items.entries()) {
            if (ids.has(item.orderItemId)) {
                ctx.addIssue({
                    code : z.ZodIssueCode.custom,
                    message : "Duplicate Order Item",
                    path : [index, "orderItemId"],
                })
            }

            ids.add(item.orderItemId)
        }
    })
})

export const returnIdSchema = z.object({
    returnId : z.coerce.number().int().positive()
})

export const returnRequestQSSchema = z.object({
    page : z.coerce.number().int().positive().min(1).default(1),
    limit : z.coerce.number().int().positive().min(1).max(50).default(20),
    sort : z.enum(ReturnSort).optional(),

    q : z.string().trim().max(100).optional(),

    returnStatus : z.enum(ReturnStatus).optional(),
    refundStatus : z.enum(RefundStatus).optional(),
    reviewedBy : z.array(z.coerce.number().int().positive()).min(1).optional(),
    orderItemId : z.array(z.coerce.number().int().positive()).min(1).optional(),

    minRefundPrice : z.coerce.number().nonnegative().optional(),
    maxRefundPrice : z.coerce.number().nonnegative().optional(),

    createdFrom : z.coerce.date().optional(),
    createdTo : z.coerce.date().optional(),

    reviewedFrom : z.coerce.date().optional(),
    reviewedTo : z.coerce.date().optional(),

    resolvedFrom : z.coerce.date().optional(),
    resolvedTo : z.coerce.date().optional(),
})
.superRefine((data, ctx) => {
    if (
        data.createdFrom !== undefined &&
        data.createdTo !== undefined &&
        data.createdFrom.getTime() > data.createdTo.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['createdTo'],
            message:
                'Created To Date Must Be Greater Than Or Equal To Created From Date'
        })
    }

    if (
        data.reviewedFrom !== undefined &&
        data.reviewedTo !== undefined &&
        data.reviewedFrom.getTime() > data.reviewedTo.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reviewedTo'],
            message:
                'Reviewed To Date Must Be Greater Than Or Equal To Reviewed From Date'
        })
    }

    if (
        data.resolvedFrom !== undefined &&
        data.resolvedTo !== undefined &&
        data.resolvedFrom.getTime() > data.resolvedTo.getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['resolvedTo'],
            message:
                'Resolved To Date Must Be Greater Than Or Equal To Resolved From Date'
        });
    }

    if (
        data.minRefundPrice !== undefined &&
        data.maxRefundPrice !== undefined &&
        data.minRefundPrice > data.maxRefundPrice
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['maxRefundPrice'],
            message:
                'Max Refund Price Must Be Greater Than Or Equal To Min Refund Price'
        });
    }
})

export const reviewReturnItemsSchema = z.object({
    items : z.array(z.object({
        itemId : z.coerce.number().int().positive(),
        status : z.enum([
            ReturnItemStatus.APPROVED,
            ReturnItemStatus.REJECTED,
        ]),
        refundAmount : z.coerce.number().nonnegative().optional(),
        adminNote : z.string().trim().max(200).optional()
    })).min(1, 'At Least A Item Is Required')
})
.superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
        if (
            item.status === ReturnItemStatus.APPROVED &&
            (item.refundAmount === undefined)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['items', index, 'refundAmount'],
                message: 'Refund Amount Is Required For Approved Item'
            })
        }

        if (
            item.status === ReturnItemStatus.REJECTED &&
            item.refundAmount !== undefined &&
            item.refundAmount > 0
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['items', index, 'refundAmount'],
                message: 'Rejected Item Can Not Have Refund Amount'
            })
        }
    })
})

export const adminNoteSchema = z.object({
    adminNote : z.string().trim().max(200, 'Max : 200 Characters').optional()
})

export const returnTrackingCodeSchema = z.object({
    trackingCode : z.string().trim().min(1, 'At Least A Character Is Required').max(100, 'Max : 100 Characters'),
    reason : z.string().trim().max(200, 'Max : 200 Characters').optional()
})

export const cancelReturnReasonSchema = z.object({
    reason : z.string().trim().min(1, 'At Least A Character Is Required').max(200, 'Max : 200 Characters')
})

export type ReturnRequestDto = z.infer<typeof returnRequestSchema>
export type ReturnIdDto = z.infer<typeof returnIdSchema>
export type ReturnRequestQSDto = z.infer<typeof returnRequestQSSchema>
export type ReviewReturnItemsDto = z.infer<typeof reviewReturnItemsSchema>
export type AdminNoteDto = z.infer<typeof adminNoteSchema>
export type ReturnTrackingCodeDto = z.infer<typeof returnTrackingCodeSchema>
export type CancelReturnReasonDto = z.infer<typeof cancelReturnReasonSchema>