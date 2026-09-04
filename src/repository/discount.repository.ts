import { Transaction, WhereOptions } from "sequelize"
import { ProductDiscount } from "../models/product.model.js"
import { CreateVariantDiscountDto } from "../validation/discount.validation.js"

class DiscountRepository {
    async getVariantDiscounts (variantId : number, where?: WhereOptions<ProductDiscount>)
    : Promise<ProductDiscount[]> {
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

    async createVariantDiscount (variantId : number, discountData : CreateVariantDiscountDto, transaction : Transaction)
    : Promise<ProductDiscount> {
        return await ProductDiscount.create({
            variantId,
            ...discountData,
        }, {
            transaction
        })
    }

    async changeVariantDiscount (variantId : number, discountId : number, data : Partial<Pick<ProductDiscount, 'type' | 'value' | 'startDate' | 'endDate'>>, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await ProductDiscount.update(data,{
            where : {
                variantId,
                id : discountId
            },
            transaction
        })
        return rows === 1
    }

    async changeVariantDiscountStatus (variantId : number, discountId : number, currentStatus : boolean, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await ProductDiscount.update({
            isActive : !currentStatus
        },{
            where : {
                isActive : currentStatus,
                variantId,
                id : discountId
            },
            transaction
        })
        return rows === 1
    }

    async deleteDiscount (variantId : number, discountId : number, transaction : Transaction)
    : Promise<boolean> {
        const rows = await ProductDiscount.destroy({
            where : {
                variantId,
                id : discountId
            },
            transaction
        })
        return rows === 1
    }
}

export default new DiscountRepository()