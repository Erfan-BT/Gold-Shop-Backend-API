import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { ReturnRequestQSDto } from "../../validation/return.validation.js";
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
}

export default new AdminReturnController()