import { col, FindAndCountOptions, literal, Op, Transaction } from "sequelize"
import Coupon from "../models/coupon.model.js"
import { CouponSchemaDto } from "../validation/coupon.validation.js";

class CouponRepository {
    async getCoupon (code : string)
    : Promise<Coupon | null> {
        return await Coupon.findOne({
            where : {
                code,
                isActive : true,
            }
        })
    }
    
    async useCoupon(couponId: number, transaction: Transaction)
    : Promise<boolean> {
        const [rows] = await Coupon.update(
            {
                usedCount: literal("usedCount + 1")
            },
            {
                where: {
                    id: couponId,
                    isActive: true,
                    usedCount: {
                        [Op.lt]: col("usageLimit")
                    }
                },
                transaction
            }
        );

        return rows === 1;
    }

    async returnCoupon(couponId: number, transaction: Transaction)
    : Promise<boolean> {
        const [rows] = await Coupon.update(
            {
                usedCount: literal("usedCount - 1")
            },
            {
                where: {
                    id: couponId,
                    isActive: true,
                    usedCount: {
                        [Op.gt]: 0
                    }
                },
                transaction
            }
        );

        return rows === 1;
    }

    // ----- Admin -----
    async getCoupons (options : FindAndCountOptions)
    {
        return await Coupon.findAndCountAll(options)
    }

    async adminGetCoupon (couponId : number)
    {
        return await Coupon.findOne({
            where : {
                id : couponId
            }
        })
    }

    async createCoupon (couponData : CouponSchemaDto)
    {
        return await Coupon.create({
            ...couponData,
            usedCount : 0,
            isActive : false
        })
    }
}

export default new CouponRepository()