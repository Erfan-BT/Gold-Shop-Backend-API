import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import type User from "./user.model.js";

export default class Address extends Model<
    InferAttributes<Address>,
    InferCreationAttributes<Address>
> {

    declare id: CreationOptional<number>;

    declare userId: ForeignKey<User["id"]>;

    declare addressLine: string;

    declare city: string;

    declare postalCode: string;

    declare isDefault: boolean;

    declare createdAt: CreationOptional<Date>;

    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare user?: NonAttribute<User>;
}

Address.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        addressLine: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        city: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        postalCode: {
            type: DataTypes.STRING(20),
            allowNull: false
        },

        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE
        },

        deletedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "Address",

        createdAt: "createdAt",

        updatedAt: false,

        deletedAt: "deletedAt",

        paranoid: true,

        indexes: [
            {
                fields: ["city"]
            },
            {
                fields: ["postalCode"],
                unique : true
            }
        ]
    }
);