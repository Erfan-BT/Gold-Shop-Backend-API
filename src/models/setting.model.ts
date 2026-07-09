import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { SettingAttributes, SettingCreationAttributes } from "../types/setting.interface.js";
import { SettingGroup, SettingType } from "../types/setting.enum.js";

const Setting = sequelize.define<Model<SettingAttributes, SettingCreationAttributes>, SettingCreationAttributes>('Setting',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        key : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        value : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        type : {
            type : DataTypes.ENUM(...Object.values(SettingType)),
            allowNull : false
        },
        group : {
            type : DataTypes.ENUM(...Object.values(SettingGroup)),
            allowNull : false
        },
        isPublic : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        description : {
            type : DataTypes.TEXT,
        },
        createdAt : {
            type : DataTypes.DATE,
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['group']
            },
            {
                fields : ['key'],
                unique : true
            }
        ]
    }
)

export default Setting