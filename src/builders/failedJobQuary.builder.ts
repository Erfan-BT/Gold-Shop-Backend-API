import {
    FindAndCountOptions,
    Op,
    Order,
    WhereOptions
} from "sequelize";
import { FailedJobsQSDto } from "../validation/failedJob.validation.js";
import FailedJob from "../models/failedJob.model.js";
import { FailedJobSort } from "../types/failedJob.enum.js";

export class FailedJobQueryBuilder {

    static build(qs : FailedJobsQSDto): FindAndCountOptions {

        const where = this.buildFailedJobWhere(qs);

        return {
            where,
            order: this.buildOrder(qs),
            limit: qs.limit,
            offset: (qs.page - 1) * qs.limit,
            distinct: true,
            // subQuery: false
        }
    }

    private static buildFailedJobWhere(
        qs: FailedJobsQSDto,
    ): WhereOptions<FailedJob> {

        const conditions: WhereOptions<FailedJob>[] = []

        if (qs.q) {
            conditions.push({
                [Op.or]: [
                    {
                        jobId : qs.q
                    },
                    {
                        jobName : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        queue : {
                            [Op.like]: `%${qs.q}%`
                        }
                    },
                    {
                        errorMessage : {
                            [Op.like]: `%${qs.q}%`
                        }
                    }
                ]
            })
        }

        if (qs.isAutoRetry !== undefined) {
            conditions.push({
                isAutoRetry : qs.isAutoRetry
            })
        }

        if (qs.isResolved !== undefined) {
            conditions.push({
                resolvedAt : qs.isResolved
                ? {
                    [Op.ne] : null
                } : {
                    [Op.is] : null
                }
            })
        }

        const dateCondition: {
            [Op.gte]?: Date;
            [Op.lte]?: Date;
        } = {};

        if (qs.failedFrom !== undefined)
            dateCondition[Op.gte] = qs.failedFrom;

        if (qs.failedTo !== undefined)
            dateCondition[Op.lte] = qs.failedTo;

        if (Object.keys(dateCondition).length) {
            conditions.push({
                failedAt : dateCondition
            })
        }

        if (!conditions.length)
            return {}

        return {
            [Op.and]: conditions
        }
    }

    private static buildOrder(
        qs: FailedJobsQSDto
    ): Order {

        switch (qs.sort) {
            case FailedJobSort.NEWEST:
                return [
                    ["failedAt", "DESC"]
                ]
            
            case FailedJobSort.OLDEST:
                return [
                    ["failedAt", "ASC"]
                ]
            
            case FailedJobSort.JOB_NAME_DESC:
                return [
                    ["jobName", "DESC"]
                ]
            
            case FailedJobSort.JOB_NAME_ASC:
                return [
                    ["jobName", "ASC"]
                ]

            case FailedJobSort.PRIORITYE_DESC:
                return [
                    ["priority", "DESC"]
                ];

            case FailedJobSort.PRIORITY_ASC:
                return [
                    ["priority", "ASC"]
                ];

            case FailedJobSort.QUEUE_DESC:
                return [
                    ["queue", "DESC"]
                ];

            case FailedJobSort.QUEUE_ASC:
                return [
                    ["queue", "ASC"]
                ];

            default:
                return [
                    ["createdAt", "DESC"]
                ];
        }

    }

}