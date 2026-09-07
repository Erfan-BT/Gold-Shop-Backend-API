import { Op } from "sequelize";
import goldPriceRepository from "../repository/goldPrice.repository.js";
import pricingRepository from "../repository/pricing.repository.js";
import productRepository from "../repository/product.repository.js";
import { ProductKarat } from "../types/product.enum.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/appError.js";

class VariantPriceService {
    async calculateVariantPrice (variantId : number)
    : Promise<number> {
        // Get Variant
        const variant = await productRepository.getVariant(variantId)
        if (!variant)
            throw new NotFoundError(`Product Variant Not Found { ID : ${variantId} }`)

        // Get Gold Price
        const goldPrice = await goldPriceRepository.getPrice()
        if (!goldPrice)
            throw new InternalServerError('Gold Price Not Found !!!')

        // Calculate
        const variantGoldKarat = variant.karat
        const variantGoldWeight = variant.weight
        const goldPricePerGram18k = goldPrice.pricePerGram18k

        let variantGoldPricePerGram = 0
        switch (variantGoldKarat) {
            case ProductKarat.KARAT_18 :
                variantGoldPricePerGram = goldPricePerGram18k
                break

            case ProductKarat.KARAT_21 :
                variantGoldPricePerGram = goldPricePerGram18k * 21 / 18
                break

            case ProductKarat.KARAT_24 :
                variantGoldPricePerGram = goldPricePerGram18k * 24 / 18
                break

            default :
                throw new InternalServerError(`Invalid Karat : ${variantGoldKarat}`)
        }

        // Net Value
        const goldValue = (variantGoldWeight * variantGoldPricePerGram)

        // Get Pricing
        const now = new Date()
        const [pricing] = await pricingRepository.getVariantPricing(variantId, {
            isActive : true,
            [Op.or] : [
                {
                    validTo : {
                        [Op.gte]: now
                    }
                },
                {
                    validTo : {
                        [Op.is]: null
                    }
                }
            ],
            validFrom : {
                [Op.lte] : now
            }
        })
        
        if (!pricing)
            throw new InternalServerError('Product Variant Not Have A Active Pricing')
        
        // Wage
        const wage = pricing.wageType === "fixed" ? pricing.wageValue : (goldValue * pricing.wageValue / 100)

        // Profit
        const profitBase = goldValue + wage
        const profit = pricing.profitType === "fixed" ? pricing.profitValue : (profitBase * pricing.profitValue / 100)

        // Tax
        const taxBase = profitBase + profit;
        const tax = taxBase * (pricing.taxPercent / 100);

        // Total Price
        return Math.round(goldValue + wage + profit + tax)
    }
}

export default new VariantPriceService()