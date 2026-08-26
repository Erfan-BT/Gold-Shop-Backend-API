import Setting from "../../models/setting.model.js"
import settingRepository from "../../repository/setting.repository.js"
import { ConflictError, NotFoundError } from "../../utils/appError.js"
import { ChangeSettingSchemaDto, CreateSettingSchemaDto, SettingQSDto } from "../../validation/setting.validation.js"

class AdminSettingService {
    async getAllSettings (qs : SettingQSDto)
    : Promise<Setting[]> {
        return await settingRepository.getAllSettings(qs)
    }

    async createSetting (settingData : CreateSettingSchemaDto)
    : Promise<Setting> {
        const setting = await settingRepository.createSetting(settingData)    
        if (!setting)
            throw new ConflictError('New Setting Data Not Created')
        return setting
    }

    async changeSetting (settingId : number, settingData : ChangeSettingSchemaDto)
    : Promise<void> {
        // Get Setting
        const setting = await settingRepository.getSetting(settingId)
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        // Data
        const data : Partial<Pick<Setting, 'key' | 'value' | 'type' | 'group' | 'description'>> = {}

        if (settingData.key !== undefined)
            data.key = settingData.key

        if (settingData.value !== undefined)
            data.value = settingData.value

        if (settingData.type !== undefined)
            data.type = settingData.type

        if (settingData.group !== undefined)
            data.group = settingData.group

        if (settingData.description !== undefined)
            data.description = settingData.description

        // Change
        if (!(await settingRepository.changeSetting(settingId, data)))
            throw new ConflictError('Setting Data Not Changed')
        return
    }

    async changeSettingStatus (settingId : number)
    : Promise<void> {
        // Get Setting
        const setting = await settingRepository.getSetting(settingId)
        if (!setting)
            throw new NotFoundError(`Setting Not Found { ID : ${settingId} }`)

        // Change Status
        if (!(await settingRepository.changeSettingStatus(settingId, setting.isPublic)))
            throw new ConflictError('Setting Status Not Changed')
        return
    }
}

export default new AdminSettingService()