import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import sequelize from "../configs/sequelize.config.js";
import { FailedJobStatus } from "../types/failedJob.enum.js";

class FailedJob extends Model<
    InferAttributes<FailedJob>,
    InferCreationAttributes<FailedJob>
> {
    declare id: CreationOptional<number>;

    declare jobName: string;
    declare queue: string;
    declare payload: string;
    declare attempts: number;

    declare errorMessage: string;
    declare errorTrace: CreationOptional<string | null>;

    declare status: FailedJobStatus;

    declare resolvedAt: CreationOptional<Date | null>;

    declare priority: number;

    declare isAutoRetry: CreationOptional<boolean>;

    declare failedAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date | null>;
}

FailedJob.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        queue: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        payload: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        errorTrace: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM(...Object.values(FailedJobStatus)),
            allowNull: false
        },
        resolvedAt: {
            type: DataTypes.DATE
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isAutoRetry: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        failedAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    },
    {
        sequelize,
        modelName: "FailedJob",
        createdAt: "failedAt",
        updatedAt: "updatedAt",
        indexes: [
            {
                fields: ["jobName"]
            },
            {
                fields: ["queue"]
            },
            {
                fields: ["status"]
            }
        ]
    }
);

export default FailedJob;