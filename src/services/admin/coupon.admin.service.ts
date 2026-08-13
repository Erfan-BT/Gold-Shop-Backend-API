import { CouponQueryBuilder } from "../../builders/couponsQuary.builder.js";
import couponRepository from "../../repository/coupon.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { CouponSchemaDto, CouponsQSDto } from "../../validation/coupon.validation.js";

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

    async createCoupon (couponData : CouponSchemaDto)
    {
        return await couponRepository.createCoupon(couponData)
    }

    async changeCoupon (couponId : number, couponData : CouponSchemaDto)
    {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)
        if (coupon.usedCount > 0)
            throw new ConflictError('The Coupon That Has Been Used Cannot Be Changed')
        // Change Coupon
        if (!(await couponRepository.changeCoupon(couponId, couponData)))
            throw new ConflictError('Coupon Not Changed')
        return
    }

    async changeCouponStatus (couponId : number)
    {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)
        // Change Coupon Status
        if (!(await couponRepository.changeCouponStatus(couponId, coupon.isActive)))
            throw new ConflictError('Coupon Status Not Changed')
        return
    }

    async deleteCoupon (couponId : number, adminId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)
        if (coupon.usedCount > 0)
            throw new ConflictError('The Coupon That Has Been Used Cannot Be Deleted')
        // Delete Coupon
        if (!(await couponRepository.deleteCoupon(couponId)))
            throw new ConflictError('Coupon Not Deleted')
        return
    }
}

export default new AdminCouponService()