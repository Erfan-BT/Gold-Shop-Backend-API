import GoldPrice from "../models/goldPrice.model.js";

class GoldPriceRepository {
    async getPrice ()
    {
        return await GoldPrice.findOne()
    }

    async changePrice (pricePerGram18k : number, source : 'system' | 'admin')
    {
        const [rows] = await GoldPrice.update({
            pricePerGram18k,
            effectiveDate : new Date(),
            source
        },{
            where : {
                id : 1
            }
        })
        return rows === 1
    }
}

export default new GoldPriceRepository()