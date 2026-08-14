import { NextFunction, Request, Response } from "express";
import goldPriceAdminService from "../services/admin/goldPrice.admin.service.js";

export class GoldPriceController {
    async getPrice (req : Request, res : Response, next : NextFunction) {
        try {
            const result = await goldPriceAdminService.getPrice()

            res.status(200).json({
                success : true,
                msg : 'Gold Price',
                data : result?.pricePerGram18k
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new GoldPriceController()