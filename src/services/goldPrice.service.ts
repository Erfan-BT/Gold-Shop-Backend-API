import { InternalServerError } from "../utils/appError.js";

class GoldPriceService {
    async getNewPrice ()
    : Promise<number> {
        // API
        const price = 1000

        // Validate Response
        if (!price || price <= 0)
            throw new InternalServerError("Invalid Gold Price");

        return price
    }
}

export default new GoldPriceService()