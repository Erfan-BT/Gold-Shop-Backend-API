import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminSettingService from "../../services/admin/setting.admin.service.js";
import { ChangeSettingDto, CreateSettingDto, SettingIdDto, SettingQSDto } from "../../validation/setting.validation.js";

class AdminSettingController {
    async getAllSettings (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as SettingQSDto
            const result = await adminSettingService.getAllSettings(qs)

            res.status(200).json({
                success : true,
                msg : 'All Setting Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
    
    async getSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdDto
            const result = await adminSettingService.getSetting(settingId)

            res.status(200).json({
                success : true,
                msg : 'Setting Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const settingData = req.validated.body as CreateSettingDto
            const adminId = req.user!.userId
            const result = await adminSettingService.createSetting(settingData, adminId)

            res.status(201).json({
                success : true,
                msg : 'Setting Successfully Created',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const settingData = req.validated.body as ChangeSettingDto
            const { settingId } = req.validated.params as SettingIdDto
            const adminId = req.user!.userId
            const result = await adminSettingService.changeSetting(settingId, settingData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Setting Successfully Changed',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeSettingStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdDto
            const adminId = req.user!.userId
            const result = await adminSettingService.changeSettingStatus(settingId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Setting Visibility Status Successfully Changed',
                data : {
                    newStatus : result
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdDto
            const adminId = req.user!.userId
            await adminSettingService.deleteSetting(settingId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Setting Deleted Successfully',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminSettingController()