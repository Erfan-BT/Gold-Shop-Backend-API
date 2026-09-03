import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import { Product } from "../../models/product.model.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductDto, CreateProductDto } from "../../validation/product.validation.js";

class AdminProductService {
    async getAllProducts (qs : AdminProductQSDto)
    : Promise<{
        rows: Product[];
        count: number;
    }> {
        // Create Options
        const options = AdminProductQueryBuilder.build(qs)
        // Get Products
        return await productRepository.getAllProducts(options)
    }

    async getProduct (productId : number)
    : Promise<Product> {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        return product
    }

    async createProduct (productData : CreateProductDto, adminId : number)
    : Promise<Product> {
        return await sequelize.transaction(async t => {
            // Create Product
            const product = await productRepository.createProduct(productData)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.CREATE,
                entityType : AdminAuditEntity.PRODUCT,
                entityId : product.id,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : productData
            }, t)

            return product
        })
        
    }

    async changeProduct (productId : number, productData : ChangeProductDto, adminId : number)
    : Promise<ChangeProductDto> {
        // Get Product
        const product = await productRepository.findProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        // Create Data
        const data: Partial<Pick<Product, "title" | "slug" | "description">> = {}

        if (productData.title !== undefined && productData.title !== product.title)
            data.title = productData.title

        if (productData.slug !== undefined && productData.slug !== product.slug)
            data.slug = productData.slug

        if (productData.description !== undefined && productData.description !== product.description)
            data.description = productData.description

        await sequelize.transaction(async t => {
            // Change Product
            if (!(await productRepository.changeProduct(productId, data, t)))
                throw new ConflictError(`Product Not Changed`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.PRODUCT,
                entityId : productId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    title : product.title,
                    slug : product.slug,
                    description : product.description
                },
                newValues : data
            }, t)
        })

        return data
    }

    async changeProductStatus (productId : number, adminId : number)
    : Promise<boolean> {
        // Get Product
        const product = await productRepository.findProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        await sequelize.transaction(async t => {
            // Change Product Status
            if (!(await productRepository.changeProductStatus(productId, product.isActive, t)))
                throw new ConflictError('Product Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.PRODUCT,
                entityId : productId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    isActive : product.isActive
                },
                newValues : {
                    isActive : !product.isActive
                }
            }, t)
        })
        
        return !product.isActive
    }

    async deleteProduct (productId : number, adminId : number)
    : Promise<void> {
        // Get Product
        const product = await productRepository.findProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)

        await sequelize.transaction(async t => {
            // Delete Product
            if (!(await productRepository.deleteProduct(productId, t)))
                throw new ConflictError('Can Not Delete This Product')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.PRODUCT,
                entityId : productId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return
    }

}

export default new AdminProductService()