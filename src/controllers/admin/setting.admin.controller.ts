import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import adminSettingService from "../../services/admin/setting.admin.service.js";
import { ChangeSettingSchemaDto, CreateSettingSchemaDto, SettingIdSchemaDto, SettingQSDto } from "../../validation/setting.validation.js";

class AdminSettingController {
    async getAllSettings (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdSchemaDto
            const result = await adminSettingService.getSetting(settingId)

            res.status(200).json({
                success : true,
                msg : 'Get Setting',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }
    
    async getSetting (req : AuthRequest, res : Response, next : NextFunction) {
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

    async createSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const settingData = req.validated.body as CreateSettingSchemaDto
            const result = await adminSettingService.createSetting(settingData)

            res.status(201).json({
                success : true,
                msg : 'Create Setting',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const settingData = req.validated.body as ChangeSettingSchemaDto
            const { settingId } = req.validated.params as SettingIdSchemaDto
            await adminSettingService.changeSetting(settingId, settingData)

            res.status(200).json({
                success : true,
                msg : 'Change Setting',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeSettingStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdSchemaDto
            await adminSettingService.changeSettingStatus(settingId)

            res.status(200).json({
                success : true,
                msg : 'Change Setting Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteSetting (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { settingId } = req.validated.params as SettingIdSchemaDto
            await adminSettingService.deleteSetting(settingId)

            res.status(200).json({
                success : true,
                msg : 'Delete Setting',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminSettingController()