import { CategoryQueryBuilder } from "../../builders/categoryQuary.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import { Category } from "../../models/category.model.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import categoryRepository from "../../repository/category.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { CategoryQSDto, CategoryDto, ChangeCategoryDto } from "../../validation/category.vallidation.js";

class AdminCategoryService {
    async getAllCategories (qs : CategoryQSDto)
    : Promise<{
        rows: Category[];
        count: number;
    }> {
        // Create Options
        const options = CategoryQueryBuilder.build(qs)
        // Get Categories
        return await categoryRepository.getCategories(options)
    }

    async createCategory (categoryData : CategoryDto, adminId : number)
    : Promise<Category> {
        // Create Category
        const category = await categoryRepository.createCategory(categoryData)
        
        // Add Admin Audit
        await adminAuditLogRepository.createAdminAuditLog({
            adminId,
            action : AdminAuditAction.CREATE,
            entityType : AdminAuditEntity.CATEGORY,
            entityId : category.id,
            ipAddress : null,
            reason : null,
            oldValues : null,
            newValues : categoryData
        }, null)

        return category
    }

    async changeCategory (categoryId : number, categoryData : ChangeCategoryDto, adminId : number)
    : Promise<ChangeCategoryDto> {
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${categoryId} }`)

        // Create Data
        const data : Partial<Pick<Category, 'title' | 'slug' | 'parentId'>> = {}

        if (categoryData.title !== undefined && categoryData.title !== category.title)
            data.title = categoryData.title

        if (categoryData.slug !== undefined && categoryData.slug !== category.slug)
            data.slug = categoryData.slug

        if (categoryData.parentId !== undefined && categoryData.parentId !== category.parentId)
            data.parentId = categoryData.parentId

        // Check ParentId
        const parentId = data.parentId
        if (parentId !== null && parentId !== undefined) {
            if (parentId === categoryId)
                throw new ConflictError('Category Can Not Be Its Own Parent')

            // Get Category
            const parentCategory = await categoryRepository.getCategory(parentId)
            if (!parentCategory)
                throw new NotFoundError(`Parent Category Not Found { ID : ${parentId} }`)
        }
        await sequelize.transaction(async t => {
            // Change Category
            if (!(await categoryRepository.changeCategory(categoryId, data, t)))
                throw new ConflictError(`Category Not Changed`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.CATEGORY,
                entityId : categoryId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    title : category.title,
                    slug : category.slug,
                    parentId : category.parentId
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async changeCategoryStatus (categoryId : number, adminId : number)
    : Promise<boolean> {
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${category} }`)

        await sequelize.transaction(async t => {
            // Change Category Status
            if (!(await categoryRepository.changeCategoryStatus(categoryId, category.isActive, t)))
                throw new ConflictError('Category Status Not Changed')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : category.isActive ? AdminAuditAction.DEACTIVATE : AdminAuditAction.ACTIVATE,
                entityType : AdminAuditEntity.CATEGORY,
                entityId : categoryId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return !category.isActive
    }

    async getCategoryChildren (categoryId : number)
    : Promise<Category[]> {
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${category} }`)

        // Get Children
        return await categoryRepository.getCategoryChildren(categoryId)
    }

    async deleteCategory (categoryId : number, adminId : number)
    : Promise<void> {
        await sequelize.transaction(async t => {
            // Delete Category
            if (!(await categoryRepository.deleteCategory(categoryId, t)))
                throw new ConflictError('Category Not Deleted')

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.CATEGORY,
                entityId : categoryId,
                ipAddress : null,
                reason : null,
                oldValues : null,
                newValues : null
            }, t)
        })

        return
    }

    // Product-Variant Categories
    async getProductCategories (productId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get P-Categories
        return await categoryRepository.getProductCategories(productId)
    }

    async setCategoryForProduct (productId : number, categoryId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${categoryId} }`)
        // Check Exists Category
        if (await categoryRepository.checkExists(productId, categoryId))
            throw new ConflictError('Product Already Has This Category')
        // Set
        return await categoryRepository.setProductCategory(productId, categoryId)
    }

    async deleteCategoryFromProduct (productId : number, categoryId : number)
    {
        if (!(await categoryRepository.deleteProductCategory(productId, categoryId)))
            throw new NotFoundError('Category Not Found In Product')
        return
    }
}

export default new AdminCategoryService()