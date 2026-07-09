import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { RoleAttributes, RoleCreationAttributes, UserRoleAttributes, UserRoleCreationAttributes } from "../types/role.interface.js";

export const Role = sequelize.define<Model<RoleAttributes, RoleCreationAttributes>, RoleCreationAttributes>('Role',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        name : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        indexes : [
            {
                fields : ['name'],
                unique : true
            }
        ]
    }
)

export const UserRole = sequelize.define<Model<UserRoleAttributes, UserRoleCreationAttributes>, UserRoleCreationAttributes>('UserRole',
    {
        id  :{
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        roleId : {
            type : DataTypes.INTEGER,
            allowNull : false
        }
    },
    {
        timestamps : false,
        indexes : [
            {
                fields : ['userId', 'roleId'],
                unique : true
            }
        ]
    }
)