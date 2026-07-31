import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ReturnRequestSchemaDto } from "../validation/return.validation.js";
import returnService from "../services/return.service.js";

class ReturnController {
    async createReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const returnRequestBody = req.validated.body as ReturnRequestSchemaDto

            const result = await returnService.createReturnRequest(userId, returnRequestBody)

            res.status(201).json({
                success : true,
                msg : 'Return Request',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getUserReturnRequests (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await returnService.getUserReturnRequests(userId)

            res.status(200).json({
                success : true,
                msg : 'Return Requests',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ReturnController()