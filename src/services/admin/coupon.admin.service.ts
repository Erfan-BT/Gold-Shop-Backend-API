import { CouponQueryBuilder } from "../../builders/couponsQuary.builder.js";
import couponRepository from "../../repository/coupon.repository.js";
import { CouponsQSDto } from "../../validation/coupon.validation.js";

class AdminCouponService {
    async getAllCoupons (qs : CouponsQSDto)
    {
        const options = CouponQueryBuilder.build(qs)
        return await couponRepository.getCoupons(options)
    }
}

export default new AdminCouponService()