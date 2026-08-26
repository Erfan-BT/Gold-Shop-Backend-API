import Setting from "../../models/setting.model.js"
import settingRepository from "../../repository/setting.repository.js"
import { ConflictError } from "../../utils/appError.js"
import { CreateSettingSchemaDto, SettingQSDto } from "../../validation/setting.validation.js"

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
}

export default new AdminSettingService()