import sequelize from "../../configs/sequelize.config.js"
import Setting from "../../models/setting.model.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import settingRepository from "../../repository/setting.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"
import { ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeSettingDto, CreateSettingDto, SettingQSDto } from "../../validation/setting.validation.js"

class AdminSettingService {
    async getAllSettings (qs : SettingQSDto)
    : Promise<Setting[]> {
        // Get Settings
        return await settingRepository.getAllSettings(qs)
    }

    async getSetting (settingId : number)
    : Promise<Setting> {
        // Get Set
        const setting = await settingRepository.getSetting(settingId)    
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        return setting
    }

    async createSetting (settingData : CreateSettingDto, adminId : number)
    : Promise<Setting> {
        return await sequelize.transaction(async t => {
            // Create
            const setting = await settingRepository.createSetting(settingData, t)
            
            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.SETTING,
                entityId : setting.id,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : settingData
            }, t)

            return setting
        })
    }

    async changeSetting (settingId : number, settingData : ChangeSettingDto, adminId : number)
    : Promise<ChangeSettingDto> {
        // Get Setting
        const setting = await settingRepository.getSetting(settingId)
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        // Create Data
        const data : Partial<Pick<Setting, 'key' | 'value' | 'type' | 'group' | 'description'>> = {}

        if (settingData.key !== undefined && settingData.key !== setting.key)
            data.key = settingData.key

        if (settingData.value !== undefined && settingData.value !== setting.value)
            data.value = settingData.value

        if (settingData.type !== undefined && settingData.type !== setting.type)
            data.type = settingData.type

        if (settingData.group !== undefined && settingData.group !== setting.group)
            data.group = settingData.group

        if (settingData.description !== undefined && settingData.description !== setting.description)
            data.description = settingData.description

        await sequelize.transaction(async t => {
            // Change Setting
            if (!(await settingRepository.changeSetting(settingId, data, t)))
                throw new ConflictError('Setting Data Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.SETTING,
                entityId : settingId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    key : setting.key,
                    value : setting.value,
                    type : setting.type,
                    group : setting.group,
                    description : setting.description,
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeSettingStatus (settingId : number, adminId : number)
    : Promise<boolean> {
        // Get Setting
        const setting = await settingRepository.getSetting(settingId)
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await settingRepository.changeSettingStatus(settingId, setting.isPublic, t)))
                throw new ConflictError('Setting Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : setting.isPublic ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.SETTING,
                entityId : settingId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return !setting.isPublic
    }

    async deleteSetting (settingId : number, adminId : number)
    : Promise<void> {
        // Get Setting
        const setting = await settingRepository.getSetting(settingId)
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        await sequelize.transaction(async t => {
            // Delete Setting
            if (!(await settingRepository.deleteSetting(settingId, t)))
                throw new ConflictError('Setting Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.SETTING,
                entityId : settingId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null,
            }, t)
        })
        
        return
    }
}

export default new AdminSettingService()