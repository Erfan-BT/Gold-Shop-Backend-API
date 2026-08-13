import { CouponQueryBuilder } from "../../builders/couponsQuary.builder.js";
import couponRepository from "../../repository/coupon.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { CouponsQSDto } from "../../validation/coupon.validation.js";

class AdminCouponService {
    async getAllCoupons (qs : CouponsQSDto)
    {
        const options = CouponQueryBuilder.build(qs)
        return await couponRepository.getCoupons(options)
    }

    async getCoupon (couponId : number)
    {
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)
        return coupon
    }
}

export default new AdminCouponService()