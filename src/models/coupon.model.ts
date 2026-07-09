import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { CouponAttributes, CouponCreationAttributes } from "../types/coupon.interface.js";
import { ProductKarat } from "../types/product.enum.js";

const Coupon = sequelize.define<Model<CouponAttributes, CouponCreationAttributes>, CouponCreationAttributes>('Coupon',
    {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        code : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        type : {
            type : DataTypes.ENUM(...Object.values(ProductKarat)),
            allowNull : false
        },
        value : {
            type : DataTypes.DECIMAL(10, 2),
            allowNull : false
        },
        usageLimit : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        usedCount : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        expiresAt : {
            type : DataTypes.DATE,
            allowNull : false
        },
        isActive : {
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
                fields : ['isActive']
            },
            {
                fields : ['code'],
                unique : true
            }
        ]
    }
)

export default Coupon