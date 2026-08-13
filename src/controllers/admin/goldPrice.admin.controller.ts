import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminGoldPriceService from "../../services/admin/goldPrice.admin.service.js";

class AdminGoldPriceController {
    async getPrice (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const result = await adminGoldPriceService.getPrice()

            res.status(200).json({
                success : true,
                msg : 'Get All Gold Prices',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminGoldPriceController()