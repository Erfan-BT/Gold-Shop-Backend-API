import { WhereOptions } from "sequelize"
import { ProductPricing } from "../models/product.model.js"
import { CreateVariantPricing } from "../validation/pricing.validation.js"

class PricingRepository {
    async getVariantPricing (variantId : number, where?: WhereOptions<ProductPricing>)
    {
        return await ProductPricing.findAll({
            where : {
                variantId,
                ...(where ?? {})
            },
            order : [
                ['priority', 'ASC']
            ]
        })
    }

    async createVariantPricing (variantId : number, pricingData : CreateVariantPricing)
    {
        return await ProductPricing.create({
            variantId,
            ...pricingData,
        })
    }

    async changeVariantPricing (variantId : number, pricingId : number, pricingData : Partial<Pick<
            ProductPricing,
            | 'wageType'
            | 'wageValue'
            | 'profitType'
            | 'profitValue'
            | 'taxPercent'
            | 'priority'
            | 'validFrom'
            | 'validTo'
        >>)
    {
        const [rows] = await ProductPricing.update(pricingData ,{
            where : {
                variantId,
                id : pricingId
            }
        })
        return rows === 1
    }

    async changeVariantPricingStatus (variantId : number, pricingId : number, currentStatus : boolean)
    {
        const [rows] = await ProductPricing.update({
            isActive : !currentStatus
        }, {
            where :{
                id : pricingId,
                variantId,
                isActive : currentStatus
            }            
        })
        return rows === 1
    }

    async deletePricing (variantId : number, pricingId : number)
    {
        const rows = await ProductPricing.destroy({
            where : {
                id : pricingId,
                variantId
            }
        })
        return rows === 1
    }
}

export default new PricingRepository