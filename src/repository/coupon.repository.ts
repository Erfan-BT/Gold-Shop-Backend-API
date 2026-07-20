import Coupon from "../models/coupon.model.js"

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
}

export default new CouponRepository()