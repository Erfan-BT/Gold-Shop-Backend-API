import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminGoldPriceService from "../../services/admin/goldPrice.admin.service.js";
import { ChangePriceDto } from "../../validation/goldPrice.validation.js";

class AdminGoldPriceController {
    async getPrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminGoldPriceService.getPrice()

            res.status(200).json({
                success : true,
                msg : 'Gold Price Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async adminChangePrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { pricePerGram18k, reason } = req.validated.body as ChangePriceDto
            const adminId = req.user!.userId
            await adminGoldPriceService.adminChangePrice(pricePerGram18k, adminId, reason, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Gold Price Changed Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

    async changeAutoUpdateStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const adminId = req.user!.userId
            const result = await adminGoldPriceService.changeAutoUpdateStatus(adminId, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Auto Update Price Status Changed Successfully',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async syncPrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const adminId = req.user!.userId
            const result = await adminGoldPriceService.syncPrice(adminId, req.ip ?? '-0-')
            
            res.status(200).json({
                success : true,
                msg : 'Sync Gold Price Successfully',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminGoldPriceController()