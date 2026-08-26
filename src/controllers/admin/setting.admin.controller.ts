import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminSettingService from "../../services/admin/setting.admin.service.js";
import { SettingQSDto } from "../../validation/setting.validation.js";

class AdminSettingController {
    async getAllSettings (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as SettingQSDto
            const result = await adminSettingService.getAllSettings(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Settings',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminSettingController()