import { Transaction, WhereOptions } from "sequelize"
import { ProductPricing } from "../models/product.model.js"
import { CreateVariantPricingDto } from "../validation/pricing.validation.js"

class PricingRepository {
    async getVariantPricing (variantId : number, where?: WhereOptions<ProductPricing>)
    : Promise<ProductPricing[]> {
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

    async createVariantPricing (variantId : number, pricingData : CreateVariantPricingDto, transaction : Transaction)
    : Promise<ProductPricing> {
        return await ProductPricing.create({
            variantId,
            ...pricingData,
        }, {
            transaction
        })
    }

    async changeVariantPricing (variantId : number, pricingId : number, data : Partial<Pick<
            ProductPricing,
            | 'wageType'
            | 'wageValue'
            | 'profitType'
            | 'profitValue'
            | 'taxPercent'
            | 'priority'
            | 'validFrom'
            | 'validTo'
        >>, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await ProductPricing.update(data ,{
            where : {
                variantId,
                id : pricingId
            },
            transaction
        })
        return rows === 1
    }

    async changeVariantPricingStatus (variantId : number, pricingId : number, currentStatus : boolean, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await ProductPricing.update({
            isActive : !currentStatus
        }, {
            where :{
                id : pricingId,
                variantId,
                isActive : currentStatus
            },
            transaction     
        })
        return rows === 1
    }

    async deletePricing (variantId : number, pricingId : number)
    : Promise<boolean> {
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