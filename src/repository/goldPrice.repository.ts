import { Transaction } from "sequelize";
import GoldPrice from "../models/goldPrice.model.js";
import { FluctuationStatus } from "../types/goldPrice.enum.js";
import { InternalServerError } from "../utils/appError.js";

class GoldPriceRepository {
    async getPrice ()
    : Promise<GoldPrice | null> {
        return await GoldPrice.findOne()
    }

    async getSalesStatus ()
    : Promise<{
        isSalesEnabled: boolean;
        salesDisabledReason: string | null;
        salesDisabledAt: Date | null;
    }> {
        const goldPrice = await GoldPrice.findOne()
        if (!goldPrice)
            throw new InternalServerError('Gold Price Not Found')

        return {
            isSalesEnabled : goldPrice.isSalesEnabled,
            salesDisabledReason : goldPrice.salesDisabledReason,
            salesDisabledAt : goldPrice.salesDisabledAt
        }
    }

    async changePrice (pricePerGram18k : number, source : 'system' | 'admin', transaction : Transaction | null)
    : Promise<boolean> {
        const [rows] = await GoldPrice.update({
            pricePerGram18k,
            effectiveDate : new Date(),
            source,
            isAutoUpdateEnabled : source === "admin" ? false : true
        },{
            where : {
                id : 1,
                isAutoUpdateEnabled : source === "admin" ? false : true
            },
            transaction
        })
        return rows === 1
    }

    async changeAutoUpdateStatus (currentStatus : boolean, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await GoldPrice.update({
            isAutoUpdateEnabled : !currentStatus
        },{
            where : {
                id : 1,
                isAutoUpdateEnabled : currentStatus
            },
            transaction
        })
        return rows === 1
    }

    async changeSalesStatus (currentStatus : boolean, reason : string, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await GoldPrice.update({
            isSalesEnabled : !currentStatus,
            salesDisabledReason : currentStatus ? reason : null,
            salesDisabledAt : currentStatus ? new Date() : null
        },{
            where : {
                id : 1,
                isSalesEnabled : currentStatus
            },
            transaction
        })
        return rows === 1
    }

    async changeFluctuationStatus (currentStatus : FluctuationStatus, newStatus : FluctuationStatus, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await GoldPrice.update({
            fluctuationStatus : newStatus
        },{
            where : {
                id : 1,
                fluctuationStatus : currentStatus
            },
            transaction
        })
        return rows === 1
    }
}

export default new GoldPriceRepository()