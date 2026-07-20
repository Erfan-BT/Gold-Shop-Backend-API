import GoldPrice from "../models/goldPrice.model.js";
import { ProductKarat } from "../types/product.enum.js";

class GoldPriceRepository {
    async getPrice (karat : ProductKarat)
    {
        return await GoldPrice.findOne({
            where : {
                karat,

            },
            order : ['effectiveDate']
        })
    }
}

export default new GoldPriceRepository()