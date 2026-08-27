import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute
} from "sequelize";

import sequelize from "../configs/sequelize.config.js";
import { UserRole } from "./role.model.js";
import Address from "./address.model.js";

export default class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {

    declare id: CreationOptional<number>;

    declare name: string;

    declare email: string;

    declare password: string;

    declare phone: string;

    declare isEmailVerified: CreationOptional<boolean>;

    declare emailVerifiedAt: CreationOptional<Date | null>;

    declare isActive: CreationOptional<boolean>;

    declare createdAt: CreationOptional<Date>;

    declare updatedAt: CreationOptional<Date>;

    declare deletedAt: CreationOptional<Date>;

    // Associations
    declare roles?: NonAttribute<UserRole[]>;
    declare addresses?: NonAttribute<Address[]>;
}

User.init(
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },

    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    emailVerifiedAt: {
        type: DataTypes.DATE
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    createdAt: {
        type: DataTypes.DATE
    },

    updatedAt: {
        type: DataTypes.DATE
    },

    deletedAt: {
        type : DataTypes.DATE
    }
},
{
    sequelize,

    modelName: "User",

    createdAt: "createdAt",

    updatedAt: "updatedAt",

    deletedAt: "deletedAt",

    paranoid : true,

    indexes: [
        {
            fields: ["email"],
            unique: true
        },
        {
            fields : ['phone'],
            unique : true
        },
        {
            fields: ["name"]
        }
    ]
})