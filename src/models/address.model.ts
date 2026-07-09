import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { AddressAttributes, AddressCreationAttributes } from "../types/address.interface.js";

const Address = sequelize.define<Model<AddressAttributes, AddressCreationAttributes>, AddressCreationAttributes>('Address',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        addressLine : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        city : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        postalCode : {
            type : DataTypes.STRING(20),
            allowNull : false
        },
        isDefault : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        createdAt : {
            type : DataTypes.DATE
        },
        deletedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : 'createdAt',
        updatedAt : false,
        deletedAt : 'deletedAt',
        paranoid : true,
        indexes : [
            {
                fields : ['city']
            },
            {
                fields : ['postalCode']
            },
            {
                fields : ['userId', 'isDefault'],
                unique : true
            }
        ]
    }
)

export default Address