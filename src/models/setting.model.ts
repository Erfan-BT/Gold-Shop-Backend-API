import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { SettingGroup, SettingType } from "../types/setting.enum.js";

class Setting extends Model<
    InferAttributes<Setting>,
    InferCreationAttributes<Setting>
> {
    declare id: CreationOptional<number>;

    declare key: string;
    declare value: string;
    declare type: SettingType;
    declare group: SettingGroup;
    declare isPublic: boolean;

    declare description: string;
    declare createdAt: CreationOptional<Date>;
}

Setting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(...Object.values(SettingType)),
            allowNull: false
        },
        group: {
            type: DataTypes.ENUM(...Object.values(SettingGroup)),
            allowNull: false
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull : false
        },
        createdAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "Setting",
        createdAt: "createdAt",
        updatedAt: false,
        indexes: [
            {
                fields: ["group"]
            },
            {
                fields: ["key"],
                unique: true
            }
        ]
    }
);

export default Setting;