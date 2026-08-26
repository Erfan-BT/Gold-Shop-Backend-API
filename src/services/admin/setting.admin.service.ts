import Setting from "../../models/setting.model.js"
import settingRepository from "../../repository/setting.repository.js"
import { SettingQSDto } from "../../validation/setting.validation.js"

class AdminSettingService {
    async getAllSettings (qs : SettingQSDto)
    : Promise<Setting[]> {
        return await settingRepository.getAllSettings(qs)
    }
}

export default new AdminSettingService()