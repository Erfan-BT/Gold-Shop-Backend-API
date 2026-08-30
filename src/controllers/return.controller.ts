import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import returnService from "../services/return.service.js";
import { CancelReturnReasonDto, ReturnIdDto, ReturnRequestDto, ReturnTrackingCodeDto } from "../validation/return.validation.js";

class ReturnController {
    async getUserReturnRequests (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const result = await returnService.getUserReturnRequests(userId)

            res.status(200).json({
                success : true,
                msg : 'User Return Requests Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { returnId } = req.validated.params as ReturnIdDto
            const result = await returnService.getReturnRequest(userId, returnId)

            res.status(200).json({
                success : true,
                msg : 'User Return Request Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

        async createReturnRequest (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const returnRequestBody = req.validated.body as ReturnRequestDto

            const result = await returnService.createReturnRequest(userId, returnRequestBody)

            res.status(201).json({
                success : true,
                msg : 'Return Request Created Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async userRegisterTrackingCode (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { userId } = req.user!
            const { returnId } = req.validated.params as ReturnIdDto
            const { trackingCode } = req.validated.body as ReturnTrackingCodeDto
            await returnService.userRegisterTrackingCode(userId, returnId, trackingCode)

            res.status(200).json({
                success : true,
                msg : 'Return Request Tracking Code Sccessfully Registered',
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
                const { userId } = req.user!
                await returnService.cancelReturnRequest(returnId, userId, reason)
    
                res.status(200).json({
                    success : true,
                    msg : 'Return Request Canceled By User Successfully',
                    data : null
                })
            } catch (error) {
                next(error)
            }
        }
}

export default new ReturnController()