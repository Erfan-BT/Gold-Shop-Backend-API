import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import { Product } from "../../models/product.model.js";
import categoryRepository from "../../repository/category.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, CreateProductSchemaDto, CreateVariantSchemaDto } from "../../validation/product.validation.js";

class AdminProductService {
    async getAllProducts (qs : AdminProductQSDto)
    {
        const options = AdminProductQueryBuilder.build(qs)
        return await productRepository.getProducts(options)
    }

    async getProduct (productId : number)
    {
        const product = await productRepository.getProductAdmin(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        return product
    }

    async createProduct (productData : CreateProductSchemaDto)
    {
        return await productRepository.createProduct(productData)
    }

    async changeProduct (productId : number, productData : ChangeProductSchemaDto)
    {
        const data: Partial<Pick<Product, "title" | "slug" | "description">> = {};
        if (productData.title !== undefined)
            data.title = productData.title
        if (productData.slug !== undefined)
            data.slug = productData.slug
        if (productData.description !== undefined)
            data.description = productData.description
        // Change Product
        if (!(await productRepository.changeProduct(productId, data)))
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        return
    }

    async changeProductStatus (productId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Change Product Status
        if (!(await productRepository.changeProductStatus(productId, product.isActive)))
            throw new ConflictError('Product Status Not Changed')
        return !product.isActive
    }

    async deleteProduct (productId : number, adminId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ID : ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Delete Product
        if (!(await productRepository.deleteProduct(productId)))
            throw new ConflictError('Can Not Delete This Product')
        return
    }

    // ---------- Categories ----------
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

    // ---------- Varinats ----------
    async getProductVariants (productId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variants
        return await productRepository.getProductVariants(productId)
    }

    async getVariant (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.getProductVariant(productId, variantId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        return variant
    }

    async createVariant (productId : number, variantData : CreateVariantSchemaDto)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Check Exists Sku
        if (await productRepository.checkExistsSku(variantData.sku))
            throw new ConflictError('This Sku Already Exists')
        // Create Varinat
        return await productRepository.createVariant(productId, variantData)
    }
}

export default new AdminProductService()