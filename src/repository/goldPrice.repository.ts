import { Transaction } from "sequelize";
import GoldPrice from "../models/goldPrice.model.js";
import { FluctuationStatus } from "../types/goldPrice.enum.js";

class GoldPriceRepository {
    async getPrice ()
    : Promise<GoldPrice | null> {
        return await GoldPrice.findOne()
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