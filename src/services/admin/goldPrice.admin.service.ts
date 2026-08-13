import goldPriceRepository from "../../repository/goldPrice.repository.js"
import { ConflictError, InternalServerError, NotFoundError } from "../../utils/appError.js"

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
        // Get Price
        const goldPrice = await goldPriceRepository.getPrice()
        if (!goldPrice)
            throw new NotFoundError(`Gold Price Not Found`);
        // Change Status
        if (!(await goldPriceRepository.changeAutoUpdateStatus(goldPrice!.isAutoUpdateEnabled)))
            throw new ConflictError('Gold Price Auto Update Status Not Changed')
        return
    }

    async syncPrice ()
    {
        // Get Price
        const goldPrice = await goldPriceRepository.getPrice();
        if (!goldPrice)
            throw new NotFoundError(`Gold Price Not Found`);

        if (!goldPrice.isAutoUpdateEnabled)
            throw new ConflictError('Automatic Gold Price Update Is Disabled');

        // Get New Price By Api
        const price = 1000
        if (!price || price <= 0)
            throw new InternalServerError("Invalid Gold Price");

        if (!(await goldPriceRepository.changePrice(price, 'system')))
            throw new InternalServerError("Gold Price Not Changed");

        return price;
    }
}

export default new AdminGoldPriceService()