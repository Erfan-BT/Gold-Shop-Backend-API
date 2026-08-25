import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { CancelReturnReasonSchemaDto, ReturnIdSchemaDto, ReturnRequestSchemaDto, ReturnTrackingCodeSchemaDto } from "../validation/return.validation.js";
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

    async getReturnRequestData (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { returnId } = req.validated.params as ReturnIdSchemaDto
            const result = await returnService.getReturnRequestData(userId, returnId)

            res.status(200).json({
                success : true,
                msg : 'Return Request Data',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async userRegisterTrackingCode (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { returnId } = req.validated.params as ReturnIdSchemaDto
            const { trackingCode } = req.validated.body as ReturnTrackingCodeSchemaDto
            await returnService.userRegisterTrackingCode(userId, returnId, trackingCode)

            res.status(200).json({
                success : true,
                msg : 'User Register Return Request Tracking Code',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async cancelReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
            try {
                const { returnId } = req.validated.params as ReturnIdSchemaDto
                const { reason } = req.validated.body as CancelReturnReasonSchemaDto
                const { userId } = req.user!
                await returnService.cancelReturnRequest(returnId, userId, reason)
    
                res.status(200).json({
                    success : true,
                    msg : 'User Cancel Return Request',
                    data : {}
                })
            } catch (error) {
                next(error)
            }
        }
}

export default new ReturnController()