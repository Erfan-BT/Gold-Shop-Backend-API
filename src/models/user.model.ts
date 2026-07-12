import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { UserAttributes, UserCreationAttributes } from "../types/user.interface.js";

const User = sequelize.define<Model<UserAttributes, UserCreationAttributes>, UserCreationAttributes>('User',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        name : {
            type : DataTypes.STRING(100),
            allowNull : false
        },
        email : {
            type : DataTypes.STRING(100),
            allowNull : false,
            validate: {
                isEmail: true
            }
        },
        password : {
            type : DataTypes.STRING(255),
            allowNull : false
        },
        phone : {
            type : DataTypes.STRING(15),
            allowNull : false
        },
        isEmailVerified : {
            type : DataTypes.BOOLEAN,
            defaultValue : false
        },
        emailVerifiedAt : {
            type : DataTypes.DATE
        },
        isActive : {
            type : DataTypes.BOOLEAN,
            defaultValue : true
        },
        createdAt : {
            type : DataTypes.DATE
        },
        updatedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt',
        indexes : [
            {
                fields : ['email'],
                unique : true
            },
            {
                fields : ['name']
            }
        ]
    }
)

export default User