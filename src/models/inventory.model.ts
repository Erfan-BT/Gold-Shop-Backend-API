import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { InventoryAttributes, InventoryCreationAttributes } from "../types/inventory.interface.js";

const Inventory = sequelize.define<Model<InventoryAttributes, InventoryCreationAttributes>, InventoryCreationAttributes>('Inventory',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        quantity : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        minThershold : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        updatedAt : {
            type : DataTypes.DATE
        }
    },
    {
        createdAt : false,
        updatedAt : 'updatedAt',
        indexes : [
            {
                fields : ['minThershold']
            },
            {
                fields : ['variantId']
            }
        ]
    }
)

export default Inventory