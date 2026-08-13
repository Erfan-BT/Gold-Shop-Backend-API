import GoldPrice from "../models/goldPrice.model.js";
import { ProductKarat } from "../types/product.enum.js";

class GoldPriceRepository {
    async getPrice ()
    {
        return await GoldPrice.findOne()
    }

    async createPrice (priceData : any)
    {
        return await GoldPrice.create(priceData)
    }
}

export default new GoldPriceRepository()