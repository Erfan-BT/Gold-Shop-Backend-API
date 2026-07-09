import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { ReviewAttributes, ReviewCreationAttributes } from "../types/review.interface.js";

const Review = sequelize.define<Model<ReviewAttributes, ReviewCreationAttributes>, ReviewCreationAttributes>('Review',
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
        variantId : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        reating : {
            type : DataTypes.TINYINT,
            allowNull : false
        },
        comment : {
            type : DataTypes.TEXT,
            allowNull : false
        },
        isApproved : {
            type : DataTypes.BOOLEAN,
            defaultValue : false
        },
        isVerifiedPurchase : {
            type : DataTypes.BOOLEAN,
            defaultValue : false
        },
        adminReplay : {
            type : DataTypes.TEXT
        },
        repliedAt : {
            type : DataTypes.DATE
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
                fields : ['isApproved']
            }
        ]
    }
)

export default Review