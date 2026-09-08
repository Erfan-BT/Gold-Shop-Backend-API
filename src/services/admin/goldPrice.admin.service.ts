import sequelize from "../../configs/sequelize.config.js"
import GoldPrice from "../../models/goldPrice.model.js"
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js"
import goldPriceRepository from "../../repository/goldPrice.repository.js"
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js"
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js"
import goldPriceService from "../goldPrice.service.js"

class AdminGoldPriceService {
    async getPrice ()
    : Promise<GoldPrice> {
        // Get Price
        const price = await goldPriceRepository.getPrice()
        if (!price)
            throw new InternalServerError('Gold Price Not Found !!!')

        return price
    }

    async adminChangePrice (pricePerGram18k : number, adminId : number, reason : string, ipAddress : string)
    : Promise<void> {
        // Get Price
        const price = await goldPriceRepository.getPrice()
        if (!price)
            throw new InternalServerError('Gold Price Not Found !!!')

        await sequelize.transaction(async t => {
            // Change Price
            if (!(await goldPriceRepository.changePrice(pricePerGram18k, 'admin', t)))
                throw new InternalServerError('Gold Price Not Changed !!!')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.GOLD_PRICE,
                entityId : 1,
                ipAddress,
                oldValues : {
                    pricePerGram18k : price.pricePerGram18k,
                    effectiveDate : price.effectiveDate,
                    source : price.source
                },
                newValues : {
                    pricePerGram18k,
                    effectiveDate : new Date(),
                    source : 'admin'
                },
                reason 
            }, t)
        })
        return
    }

    async changeAutoUpdateStatus (adminId : number, ipAddress : string)
    : Promise<boolean> {
        // Get Price
        const goldPrice = await goldPriceRepository.getPrice()
        if (!goldPrice)
            throw new InternalServerError('Gold Price Not Found !!!')

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await goldPriceRepository.changeAutoUpdateStatus(goldPrice.isAutoUpdateEnabled, t)))
                throw new ConflictError('Gold Price Auto Update Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.GOLD_PRICE,
                entityId : 1,
                oldValues : {
                    isAutoUpdateEnabled : goldPrice.isAutoUpdateEnabled
                },
                newValues : {
                    isAutoUpdateEnabled : !goldPrice.isAutoUpdateEnabled
                },
                ipAddress,
                reason : null
            }, t)
        })
        
        return !goldPrice.isAutoUpdateEnabled
    }

    async syncPrice (adminId : number, ipAddress : string)
    : Promise<number> {
        // Get Price
        const goldPrice = await goldPriceRepository.getPrice();
        if (!goldPrice)
            throw new InternalServerError('Gold Price Not Found !!!')

        if (!goldPrice.isAutoUpdateEnabled)
            throw new BadRequestError('Automatic Gold Price Update Is Disabled');

        // Get New Price By Api
        const price = await goldPriceService.getNewPrice()

        await sequelize.transaction(async t => {
            // Change Price
            if (!(await goldPriceRepository.changePrice(price, 'system', t)))
                throw new InternalServerError('Gold Price Not Changed !!!')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.GOLD_PRICE,
                entityId : 1,
                ipAddress,
                oldValues : {
                    pricePerGram18k : goldPrice.pricePerGram18k,
                    effectiveDate : goldPrice.effectiveDate,
                    source : goldPrice.source
                },
                newValues : {
                    pricePerGram18k : price,
                    effectiveDate : new Date(),
                    source : 'system'
                },
                reason : null,
            }, t)
        })

        return price;
    }

    async changeSalesStatus (adminId : number, reason : string, ipAddress : string)
    : Promise<boolean> {
        // Get Sales Status
        const sales = await goldPriceRepository.getSalesStatus()

        await sequelize.transaction(async t => {
            // Change Status
            if (!(await goldPriceRepository.changeSalesStatus(sales.isSalesEnabled, reason, t)))
                throw new ConflictError('Sales Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.GOLD_PRICE,
                entityId : 1,
                ipAddress,
                reason,
                oldValues : sales,
                newValues : await goldPriceRepository.getSalesStatus()
            }, t)
        })

        return !sales.isSalesEnabled
    }
}

export default new AdminGoldPriceService()