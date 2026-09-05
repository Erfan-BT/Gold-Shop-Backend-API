import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminNoteDto, CancelReturnReasonDto, ReturnIdDto, ReturnRequestQSDto, ReturnTrackingCodeDto, ReviewReturnItemsDto } from "../../validation/return.validation.js";
import adminReturnService from "../../services/admin/return.admin.service.js";

class AdminReturnController {
    async getAllReturnRequests (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as ReturnRequestQSDto
            const result = await adminReturnService.getAllReturnRequests(qs)

            res.status(200).json({
                success : true,
                msg : 'All Return Requests Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const result = await adminReturnService.getReturnRequest(returnId)

            res.status(200).json({
                success : true,
                msg : 'Return Request Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async reviewReturnItems (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const reviewData = req.validated.body as ReviewReturnItemsDto
            const adminId = req.user!.userId
            const result = await adminReturnService.reviewReturnItems(returnId, adminId, reviewData)

            res.status(200).json({
                success : true,
                msg : 'Return Items Successfully Checked',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async finalizeReturn (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const { adminNote } = req.validated.body as AdminNoteDto
            const adminId = req.user!.userId
            const result = await adminReturnService.finalizeReturn(returnId, adminId, adminNote ?? null, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Return Request Successfully Finalized',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async adminChangeTrackingCode (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const { trackingCode, reason } = req.validated.body as ReturnTrackingCodeDto
            const adminId = req.user!.userId
            await adminReturnService.adminChangeTrackingCode(returnId, adminId, trackingCode, reason ?? null, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Return Tracking Code Successfully Changed',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async verifyReturnedItems (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const adminId = req.user!.userId
            await adminReturnService.verifyReturnedItems(returnId, adminId, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Return Process Verified Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async cancelReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdDto
            const { reason } = req.validated.body as CancelReturnReasonDto
            const adminId = req.user!.userId
            await adminReturnService.cancelReturnRequest(returnId, adminId, reason, req.ip ?? '-0-')

            res.status(200).json({
                success : true,
                msg : 'Return Request Successfully Canceled',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminReturnController()