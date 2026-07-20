import couponRepository from "../repository/coupon.repository.js";
import { CouponData } from "../types/order.type.js";
import { BadRequestError } from "./appError.js";

class CouponHelper {
    async validateAndCalculate (couponCode : string, lineTotal : number)
    : Promise<CouponData> {
        const now = new Date()
        const coupon = await couponRepository.getCoupon(couponCode)
        if (!coupon)
            throw new BadRequestError('Invalid Coupon')
        if (coupon.usedCount >= coupon.usageLimit)
            throw new BadRequestError('Coupon Usage Limit Reached')
        if (coupon.expiresAt.getTime <= now.getTime)
            throw new BadRequestError('Coupon Expired')

        const couponDiscount = coupon.type === "fixed"
            ? Math.min(lineTotal, coupon.value)
            : (lineTotal * coupon.value) / 100;
        return {
            couponId : coupon.id,
            couponCode : coupon.code,
            couponType : coupon.type,
            couponValue : coupon.value,
            couponDiscount
        }
    }
}

export default new CouponHelper()