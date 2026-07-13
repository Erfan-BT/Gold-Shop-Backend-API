import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";

class Coupon extends Model<
    InferAttributes<Coupon>,
    InferCreationAttributes<Coupon>
> {
    declare id: CreationOptional<number>;

    declare code: string;
    declare type: "fixed" | "percent";
    declare value: number;

    declare usageLimit: number;
    declare usedCount: number;

    declare expiresAt: Date;
    declare isActive: boolean;

    declare createdAt: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date | null>;
}

Coupon.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM("fixed", "percent"),
            allowNull: false
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        usageLimit: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usedCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isActive: {
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
        modelName: "Coupon",
        createdAt: "createdAt",
        updatedAt: false,
        deletedAt: "deletedAt",
        paranoid: true,
        indexes: [
            {
                fields: ["isActive"]
            },
            {
                fields: ["code"],
                unique: true
            }
        ]
    }
);

export default Coupon;