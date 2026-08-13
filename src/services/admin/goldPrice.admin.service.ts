import goldPriceRepository from "../../repository/goldPrice.repository.js"

class AdminGoldPriceService {
    async getPrice ()
    {
        return await goldPriceRepository.getPrice()
    }
}

export default new AdminGoldPriceService()