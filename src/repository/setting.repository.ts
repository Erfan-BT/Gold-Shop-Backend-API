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

    async getSetting (settingId : number)
    : Promise<Setting | null> {
        return await Setting.findOne({
            where : {
                id : settingId
            }
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

    async changeSetting (settingId : number, data : Partial<Pick<Setting, 'key' | 'value' | 'type' | 'group' | 'description'>>)
    : Promise<boolean> {
        const [rows] = await Setting.update(data,{
            where : {
                id : settingId
            }
        })
        return rows === 1
    }

    async changeSettingStatus (settingId : number, currentStatus : boolean)
    : Promise<boolean> {
        const [rows] = await Setting.update({
            isPublic : !currentStatus
        },{
            where : {
                id : settingId,
                isPublic : currentStatus
            }
        })
        return rows === 1
    }

    async deleteSetting (settingId : number)
    : Promise<boolean> {
        const rows = await Setting.destroy({
            where : {
                id : settingId
            }
        })
        return rows === 1
    }

}

export default new SettingRepository()