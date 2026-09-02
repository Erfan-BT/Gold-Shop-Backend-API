import { CouponQueryBuilder } from "../../builders/couponsQuary.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import Coupon from "../../models/coupon.model.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import couponRepository from "../../repository/coupon.repository.js";
import userRepository from "../../repository/user.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { RolesTitle } from "../../types/role.enum.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { ChangeCouponDto, CouponDto, CouponsQSDto } from "../../validation/coupon.validation.js";

class AdminCouponService {
    async getAllCoupons (qs : CouponsQSDto)
    : Promise<{
        rows: Coupon[];
        count: number;
    }> {
        // Create Options
        const options = CouponQueryBuilder.build(qs)

        // Get Coupons
        return await couponRepository.getCoupons(options)
    }

    async getCoupon (couponId : number)
    : Promise<Coupon> {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)

        return coupon
    }

    async createCoupon (couponData : CouponDto, adminId : number)
    : Promise<Coupon> {
        return await sequelize.transaction(async t => {
            // Create Coupon
            const coupon = await couponRepository.createCoupon(couponData, t)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.COUPON,
                entityId : coupon.id,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : couponData
            }, t)

            return coupon
        })
    }

    async changeCoupon (couponId : number, couponData : ChangeCouponDto, adminId : number)
    : Promise<ChangeCouponDto> {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)

        // Create Data
        const data : Partial<Pick<Coupon, 'code' | 'type' | 'value' | 'usageLimit' | 'expiresAt'>> = {}
        let isRestructuring : boolean = false

        if (couponData.code !== undefined && couponData.code !== coupon.code) {
            data.code = couponData.code
            isRestructuring = true
        }

        if (couponData.type !== undefined && couponData.type !== coupon.type) {
            data.type = couponData.type
            isRestructuring = true
        }

        if (couponData.value !== undefined && couponData.value !== coupon.value) {
            data.value = couponData.value
            isRestructuring = true
        }

        if (couponData.usageLimit !== undefined && couponData.usageLimit !== coupon.usageLimit)
            data.usageLimit = couponData.usageLimit

        if (couponData.expiresAt !== undefined && couponData.expiresAt !== coupon.expiresAt)
            data.expiresAt = couponData.expiresAt

        // Check Value
        const finalType = data.type ?? coupon.type
        const finalValue = data.value ?? coupon.value

        if (finalType === "percent" && finalValue > 100)
            throw new BadRequestError('Type Is Percentage, Value Can Not Be Greater Than 100')

        // Check Used Count
        if (coupon.usedCount > 0 && isRestructuring)
            throw new ConflictError('The Coupon That Has Been Used Can Not Be Changed')

        await sequelize.transaction(async t => {
            // Change Coupon
            if (!(await couponRepository.changeCoupon(couponId, isRestructuring, data, t)))
                throw new ConflictError('Coupon Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.COUPON,
                entityId : couponId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    code : coupon.code,
                    type : coupon.type,
                    value : coupon.value,
                    usageLimit : coupon.usageLimit,
                    expiresAt : coupon.expiresAt
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeCouponStatus (couponId : number, adminId : number)
    : Promise<boolean> {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)
        
        // Check Expires Date
        if (!coupon.isActive && coupon.expiresAt.getTime() < new Date().getTime())
            throw new BadRequestError('Coupon Expired, Can Not Be Activated')

        // Check Used Count
        if (!coupon.isActive && coupon.usedCount >= coupon.usageLimit)
            throw new BadRequestError('Coupon Limit Filled, Can Not Be Activated')

        await sequelize.transaction(async t => {
            // Change Coupon Status
            if (!(await couponRepository.changeCouponStatus(couponId, coupon.isActive, t)))
                throw new ConflictError('Coupon Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : coupon.isActive ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.COUPON,
                entityId : couponId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return !coupon.isActive
    }

    async deleteCoupon (couponId : number, adminId : number)
    : Promise<void> {
        // Get Coupon
        const coupon = await couponRepository.adminGetCoupon(couponId)
        if (!coupon)
            throw new NotFoundError(`Coupon Not Found { ID : ${couponId} }`)

        if (coupon.usedCount > 0)
            throw new ConflictError('The Coupon That Has Been Used Cannot Be Deleted')

        await sequelize.transaction(async t => {
            // Delete Coupon
            if (!(await couponRepository.deleteCoupon(couponId, t)))
                throw new ConflictError('Coupon Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.COUPON,
                entityId : couponId,
                ipAddress : null,
                newValues : null,
                oldValues : null,
                reason : null
            }, t)
        })

        return
    }
}

export default new AdminCouponService()