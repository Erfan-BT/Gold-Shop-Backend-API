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
import User from "./user.model.js";
import { ProductVariant } from "./product.model.js";

class Review extends Model<
    InferAttributes<Review>,
    InferCreationAttributes<Review>
> {
    declare id: CreationOptional<number>;

    declare userId: ForeignKey<User["id"]>;
    declare variantId: ForeignKey<ProductVariant["id"]>;

    declare rating: number;
    declare comment: string;

    declare isApproved: CreationOptional<boolean>;
    declare isVerifiedPurchase: CreationOptional<boolean>;

    declare adminReply: string | null;
    declare repliedAt: Date | null;

    declare createdAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date | null>;

    // Associations
    declare user?: NonAttribute<User>;
    declare variant?: NonAttribute<ProductVariant>;
}

Review.init(
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
        variantId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rating: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isVerifiedPurchase: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        adminReply: {
            type: DataTypes.TEXT
        },
        repliedAt: {
            type: DataTypes.DATE
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
        modelName: "Review",
        createdAt: "createdAt",
        updatedAt: false,
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["isApproved"]
            }
        ]
    }
);

export default Review;