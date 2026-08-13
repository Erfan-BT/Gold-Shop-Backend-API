import goldPriceRepository from "../../repository/goldPrice.repository.js"
import { ConflictError, InternalServerError } from "../../utils/appError.js"

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

    async changeAutoUpdateStatus ()
    {
        const price = await goldPriceRepository.getPrice()
        if (!(await goldPriceRepository.changeAutoUpdateStatus(price!.isAutoUpdateEnabled)))
            throw new ConflictError('Gold Price Auto Update Status Not Changed')
        return
    }
}

export default new AdminGoldPriceService()