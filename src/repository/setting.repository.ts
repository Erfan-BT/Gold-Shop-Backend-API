import { Op } from "sequelize"
import Setting from "../models/setting.model.js"
import { CreateSettingSchemaDto, SettingQSDto } from "../validation/setting.validation.js"

class SettingRepository {
    async getAllSettings (qs : SettingQSDto)
    : Promise<Setting[]> {
        return await Setting.findAll({
            attributes : [
                'id',
                'key',
                'value',
                'type',
                'group',
                'isPublic',
                'description',
                'createdAt'
            ],
            where : {
                ...(qs.isPublic !== undefined 
                    ? {
                        isPublic : qs.isPublic
                    }
                    : {}
                ),
                ...(qs.group !== undefined && qs.group.length  > 0
                    ? {
                        group : {
                            [Op.in] : qs.group
                        }
                    }
                    : {}
                ),
                ...(qs.q !== undefined
                    ? {
                        [Op.or]: [
                            {
                                key: {
                                    [Op.like]: `%${qs.q}%`
                                }
                            },
                            {
                                value: {
                                    [Op.like]: `%${qs.q}%`
                                }
                            },
                            {
                                description: {
                                    [Op.like]: `%${qs.q}%`
                                }
                            }
                        ]
                    }
                    : {}
                )
            },
            order: [
                ['group', 'ASC'],
                ['key', 'ASC']
            ]
        })
    }

    async createSetting (settingData : CreateSettingSchemaDto)
    : Promise<Setting> {
        return await Setting.create({
            key : settingData.key,
            value : settingData.value,
            type : settingData.type,
            group : settingData.group,
            isPublic : settingData.isPublic,
            description : settingData.description ?? null
        })
    }
}

export default new SettingRepository()