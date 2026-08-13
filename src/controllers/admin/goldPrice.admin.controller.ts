import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminGoldPriceService from "../../services/admin/goldPrice.admin.service.js";
import { ChangePriceSchemaDto } from "../../validation/goldPrice.validation.js";

class AdminGoldPriceController {
    async getPrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminGoldPriceService.getPrice()

            res.status(200).json({
                success : true,
                msg : 'Get Gold Price',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async adminChangePrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { pricePerGram18k } = req.validated.body as ChangePriceSchemaDto
            await adminGoldPriceService.adminChangePrice(pricePerGram18k)
            
            res.status(200).json({
                success : true,
                msg : 'Change Price',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeAutoUpdateStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            await adminGoldPriceService.changeAutoUpdateStatus()
            
            res.status(200).json({
                success : true,
                msg : 'Change Auto Update Price Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async syncPrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminGoldPriceService.syncPrice()
            
            res.status(200).json({
                success : true,
                msg : 'Sync Gold Price',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminGoldPriceController()