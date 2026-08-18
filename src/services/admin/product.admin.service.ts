import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import { Product, ProductVariant } from "../../models/product.model.js";
import categoryRepository from "../../repository/category.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, ChangeVariantSchemaDto, CreateProductSchemaDto, CreateVariantSchemaDto, variantId } from "../../validation/product.validation.js";
import { ImageService } from "../image.service.js";

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

    async changeVariant (productId : number, variantId : number, variantData : ChangeVariantSchemaDto)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Create Data
        const data : Partial<Pick<ProductVariant, 'weight' | 'karat' | 'stoneType' | 'color' | 'sku' >> = {}

        if (variantData.weight !== undefined)
            data.weight = variantData.weight

        if (variantData.karat !== undefined)
            data.karat = variantData.karat

        if (variantData.stoneType !== undefined)
            data.stoneType = variantData.stoneType

        if (variantData.color !== undefined)
            data.color = variantData.color

        if (variantData.sku !== undefined)
            data.sku = variantData.sku

        // Check Exists Sku
        if (variantData.sku !== undefined && await productRepository.checkExistsSku(variantData.sku, variantId))
            throw new ConflictError('This Sku Already Exists')
        // Change Varinat
        if (!(await productRepository.changeVariant(productId, variantId, data)))
            throw new ConflictError('Product Variant Data Not Changed')
        return
    }

    async changeVariantStatus (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Change Status
        if (!(await productRepository.changeVariantStatus(productId, variantId, variant.isActive)))
            throw new ConflictError('Product Variant Status Not Changed')
        return
    }

    async deleteVariant (adminId : number, productId : number, variantId : number)
    {
        // Get Admin
        const admin = await userRepository.userById(adminId)
        if (!admin)
            throw new NotFoundError(`Admin Not Found { ${adminId} }`)
        const isOwner = admin.roles?.some(userRole => userRole.role?.name === RolesTitle.OWNER) ?? false
        if (!isOwner)
            throw new ForbiddenError('Not Access')
        // Delete
        if (!(await productRepository.deleteVariant(productId, variantId)))
            throw new NotFoundError(`Product Or Variant Not Found { P-ID : ${productId}, V-ID : ${variantId} }`)
        return
    }

    // ---------- Images ----------
    async getVariantImages (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Images
        return await productRepository.getVariantImages(variantId)
    }

    async addVariantImages (productId: number, variantId: number, files: Express.Multer.File[])
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Check Images
        if (files.length === 0) {
            throw new BadRequestError('At Least One Image Is Required');
        }

        const processedImages : {
            filename: string;
            path: string;
            url: string;
        }[] = [];

        try {
            // Process all files
            for (const file of files) {
                const image =
                    await ImageService.processVariantImage(file)
                processedImages.push(image);
            }
            // Insert DB
            const images = [];
            try {
                for (let i = 0; i < processedImages.length; i++) {
                    const image =
                        await productRepository.createVariantImage(
                            variantId,
                            processedImages[i]!.url,
                            processedImages[i]!.filename,
                            processedImages[i]!.filename,
                            i,
                            i === 0 && !(await productRepository.hasPrimaryImage(variantId)),
                        )
                    images.push(image);
                }
            } catch (error) {
                // Remove Generated Files
                await Promise.all(
                    processedImages.map(
                        image =>
                            ImageService.deleteImage(image.path)
                    )
                )
                throw error;
            }
            return images;
        } catch (error) {
            // Processing failed
            // Remove Already Generated Files

            await Promise.all(
                processedImages.map(
                    image =>
                        ImageService.deleteImage(image.path)
                )
            )
            throw error;
        }

    }

    async changeImageAltText (productId: number, variantId: number, imageId : number, altText : string)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Change Image AltText
        if (!(await productRepository.changeImageAltText(variantId, imageId, altText)))
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        return
    }
}

export default new AdminProductService()