import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { ReturnIdSchemaDto, ReturnRequestQSDto } from "../../validation/return.validation.js";
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
}

export default new AdminReturnController()