import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminNoteSchemaDto, ReturnIdSchemaDto, ReturnRequestQSDto, ReviewReturnItemsSchemaDto } from "../../validation/return.validation.js";
import adminReturnService from "../../services/admin/return.admin.service.js";

class AdminReturnController {
    async getAllReturnRequests (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as ReturnRequestQSDto
            const result = await adminReturnService.getAllReturnRequests(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Return Requests',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdSchemaDto
            const result = await adminReturnService.getReturnRequest(returnId)

            res.status(200).json({
                success : true,
                msg : 'Get Return Request',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async reviewReturnItems (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdSchemaDto
            const reviewData = req.validated.body as ReviewReturnItemsSchemaDto
            const adminId = req.user!.userId
            await adminReturnService.reviewReturnItems(returnId, adminId, reviewData)

            res.status(200).json({
                success : true,
                msg : 'Review Return Items',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async finalizeReturn (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { returnId } = req.validated.params as ReturnIdSchemaDto
            const { adminNote } = req.validated.body as AdminNoteSchemaDto
            const adminId = req.user!.userId
            const result = await adminReturnService.finalizeReturn(returnId, adminId, adminNote)

            res.status(200).json({
                success : true,
                msg : 'Finalize Return Request',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminReturnController()