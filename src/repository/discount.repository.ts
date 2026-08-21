import { WhereOptions } from "sequelize"
import { ProductDiscount } from "../models/product.model.js"
import { CreateVariantDiscount } from "../validation/discount.validation.js"

class DiscountRepository {
    async getVariantDiscounts (variantId : number, where?: WhereOptions<ProductDiscount>)
    {
        return await ProductDiscount.findAll({
            where : {
                variantId,
                ...(where ?? {})
            },
            order : [
                ['startDate', 'DESC']
            ]
        })
    }

    async createVariantDiscount (variantId : number, discountData : CreateVariantDiscount)
    {
        return await ProductDiscount.create({
            variantId,
            ...discountData,
        })
    }

    async changeVariantDiscount (variantId : number, discountId : number, data : Partial<Pick<
        ProductDiscount,
          'type'
        | 'value'
        | 'startDate'
        | 'endDate'
    >>)
    {
        const [rows] = await ProductDiscount.update(data,{
            where : {
                variantId,
                id : discountId
            }
        })
        return rows === 1
    }

    async changeVariantDiscountStatus (variantId : number, discountId : number, currentStatus : boolean)
    {
        const [rows] = await ProductDiscount.update({
            isActive : !currentStatus
        },{
            where : {
                isActive : currentStatus,
                variantId,
                id : discountId
            }
        })
        return rows === 1
    }

    async deleteDiscount (variantId : number, discountId : number)
    {
        const rows = await ProductDiscount.destroy({
            where : {
                variantId,
                id : discountId
            }
        })
        return rows === 1
    }
}

export default new DiscountRepository()