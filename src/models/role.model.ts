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

// Role
export class Role extends Model<
    InferAttributes<Role>,
    InferCreationAttributes<Role>
> {

    declare id: CreationOptional<number>;

    declare name: string;

    declare createdAt: CreationOptional<Date>;

    // Associations
    declare users?: NonAttribute<UserRole[]>;
}

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,

        modelName: "Role",

        createdAt: "createdAt",

        updatedAt: false,

        indexes: [
            {
                fields: ["name"],
                unique: true
            }
        ]
    }
)

// UserRole
export class UserRole extends Model<
    InferAttributes<UserRole>,
    InferCreationAttributes<UserRole>
> {

    declare id: CreationOptional<number>;

    declare userId: ForeignKey<User["id"]>;

    declare roleId: ForeignKey<Role["id"]>;

    // Associations
    declare user?: NonAttribute<User>;

    declare role?: NonAttribute<Role>;
}

UserRole.init(
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

        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,

        modelName: "UserRole",

        timestamps: false,

        indexes: [
            {
                fields: ["userId", "roleId"],
                unique: true
            }
        ]
    }
);