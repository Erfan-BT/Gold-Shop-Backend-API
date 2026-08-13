import goldPriceRepository from "../../repository/goldPrice.repository.js"
import { InternalServerError } from "../../utils/appError.js"

class AdminGoldPriceService {
    async getPrice ()
    {
        return await goldPriceRepository.getPrice()
    }

    async adminChangePrice (pricePerGram18k : number)
    {
        if (!(await goldPriceRepository.changePrice(pricePerGram18k, 'admin')))
            throw new InternalServerError('Gold Price Not Changed !!!')
        return
    }
}

export default new AdminGoldPriceService()