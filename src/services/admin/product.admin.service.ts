import { is } from "zod/locales";
import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import { Product, ProductPricing, ProductVariant } from "../../models/product.model.js";
import categoryRepository from "../../repository/category.repository.js";
import productRepository from "../../repository/product.repository.js";
import userRepository from "../../repository/user.repository.js";
import { RolesTitle } from "../../types/role.enum.js";
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, ChangeVariantPricing, ChangeVariantSchemaDto, CreateProductSchemaDto, CreateVariantPricing, CreateVariantSchemaDto, ImageIdsSchemaDto, variantId } from "../../validation/product.validation.js";
import { ImageService } from "../image.service.js";
import { Op } from "sequelize";

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

    async changeVariantImagePrimary (productId: number, variantId: number, imageId : number)
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
        const images = await productRepository.getVariantImages(variantId)
        if (images.length === 0)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        const imageExists = images.some(image => image.id === imageId)
        if (!imageExists)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        // Check Is Primary
        const isPrimary = await productRepository.isPrimaryImage(variantId, imageId)
        if (isPrimary)
                return
        // Change
        await sequelize.transaction(async t => {
            // Set Variant Images Primary False
            await productRepository.setVariantImagesPrimaryFalse(variantId, t)
            // Set Image Primary
            if (!(await productRepository.setVariantImagePrimary(variantId, imageId, t)))
                throw new ConflictError(`Primary Image Not Changed`)
        })
        return
    }

    async changeVariantImagesOrder (productId : number, variantId : number, imageIds : number[])
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
        const images = await productRepository.getVariantImages(variantId)
        if (images.length < 1)
            throw new ConflictError('Sorting Is Not Possible')
        if (images.length !== imageIds.length)
            throw new BadRequestError('All Variant Images Must Be Included')
        // Check Ids
        const existingIds = new Set(images.map(image => image.id))

        const hasInvalidImage = imageIds.some(id => !existingIds.has(id))
        if (hasInvalidImage)
            throw new BadRequestError('Invalid Variant Image Ids')
        
        const uniqueIds = new Set(imageIds);
        if (uniqueIds.size !== imageIds.length)
            throw new BadRequestError('Duplicate Image IDs Are Not Allowed');

        // ReOrder
        await sequelize.transaction(async t => {
            for (let i = 0; i < imageIds.length; i++) {
                if (!(await productRepository.changeImageSortOrder(variantId, imageIds[i]!, i + 1, t)))
                    throw new InternalServerError('Error In Change Images Order')
            }
        })
        return
    }

    async deleteImage (productId : number, variantId : number, imageId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Image
        const image = await productRepository.getVariantImage(variantId, imageId)
        if (!image)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        if (image.isPrimary)
            throw new ConflictError('Primary Image Can Not Be Deleted')
        // Delete From DB
        if (!(await productRepository.deleteImage(variantId, imageId)))
            throw new ConflictError('Image Not Deleted')
        // Delete Physical
        await ImageService.deleteImage(image.fileName)
        return
    }

    // ---------- Pricing ----------
    async getVariantPricing (productId : number, variantId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Pricing
        return await productRepository.getVariantPricing(variantId)
    }

    async createVariantPricing (productId : number, variantId : number, pricingData : CreateVariantPricing)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get Variant Pricing
        const now = new Date()
        const pricing = await productRepository.getVariantPricing(variantId,
            {
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte]: now
                        }
                    },
                    {
                        validTo : {
                            [Op.is]: null
                        }
                    }
                ]
            })
        // Check Pricing
        if (pricingData.isActive) {
            if (pricing.length > 0) {
            const hasPriorityOverlap = pricing.some(
                existingPricing =>
                    existingPricing.priority === pricingData.priority &&
                    (
                        (existingPricing.validTo === null || existingPricing.validTo.getTime() >= pricingData.validFrom.getTime()) &&
                        (pricingData.validTo === null || pricingData.validTo.getTime() >= existingPricing.validFrom.getTime())
                    )
            )
            if (hasPriorityOverlap)
                throw new ConflictError('Another Pricing With The Same Priority Has An Overlapping Date Range')
            }
        }
        // Create
        return await productRepository.createVariantPricing(variantId, pricingData)
    }

    async changeVariantPricing (productId : number, variantId : number, pricingId : number, pricingData : ChangeVariantPricing)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await productRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
        // Check Data
        const finalWageType = pricingData.wageType ?? pricing.wageType
        const finalWageValue = pricingData.wageValue ?? pricing.wageValue
        const finalProfitType = pricingData.profitType ?? pricing.profitType
        const finalProfitValue = pricingData.profitValue ?? pricing.profitValue

        if (finalWageType === 'percent' && finalWageValue > 100)
            throw new BadRequestError('Wage Percent Must Be Between 0 And 100')

        if (finalProfitType === 'percent' && finalProfitValue > 100)
            throw new BadRequestError('Profit Percent Must Be Between 0 And 100')

        const finalValidFrom = pricingData.validFrom ?? pricing.validFrom;
        const finalValidTo = pricingData.validTo !== undefined ? pricingData.validTo : pricing.validTo;

        if (finalValidTo !== null && finalValidFrom.getTime() > finalValidTo.getTime())
            throw new BadRequestError('Valid To Date Must Be Greater Than Or Equal To Valid From Date')

        const finalPriority = pricingData.priority ?? pricing.priority;
        // Get Variant Pricing && Overlap
        if (pricing.isActive) {
            const now = new Date()
            const allPricing = await productRepository.getVariantPricing(variantId,
                {
                    id : {
                        [Op.ne] : pricingId
                    },
                    isActive : true,
                    [Op.or] : [
                        {
                            validTo : {
                                [Op.gte]: now
                            }
                        },
                        {
                            validTo : {
                                [Op.is]: null
                            }
                        }
                    ]
                })
            if (allPricing.length > 0) {
            const hasPriorityOverlap = allPricing.some(
                existingPricing =>
                    existingPricing.priority === finalPriority &&
                    (
                        (existingPricing.validTo === null || existingPricing.validTo.getTime() >= finalValidFrom.getTime()) &&
                        (finalValidTo === null || finalValidTo.getTime() >= existingPricing.validFrom.getTime())
                    )
            )
            if (hasPriorityOverlap)
                throw new ConflictError('Another Pricing With The Same Priority Has An Overlapping Date Range')
            }
        }
        
        // Change
        const data: Partial<Pick<
            ProductPricing,
            | 'wageType'
            | 'wageValue'
            | 'profitType'
            | 'profitValue'
            | 'taxPercent'
            | 'priority'
            | 'validFrom'
            | 'validTo'
        >> = {};

        if (pricingData.wageType !== undefined)
            data.wageType = pricingData.wageType;

        if (pricingData.wageValue !== undefined)
            data.wageValue = pricingData.wageValue;

        if (pricingData.profitType !== undefined)
            data.profitType = pricingData.profitType;

        if (pricingData.profitValue !== undefined)
            data.profitValue = pricingData.profitValue;

        if (pricingData.taxPercent !== undefined)
            data.taxPercent = pricingData.taxPercent;

        if (pricingData.priority !== undefined)
            data.priority = pricingData.priority;

        if (pricingData.validFrom !== undefined)
            data.validFrom = pricingData.validFrom;

        if (pricingData.validTo !== undefined)
            data.validTo = pricingData.validTo;


        if (!(await productRepository.changeVariantPricing(variantId, pricingId, data)))
            throw new ConflictError(`Variant Pricing NoT Changed`)
        return
    }

    async changeVariantPricingStatus (productId : number, variantId : number, pricingId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await productRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
        // Get Other Pricing
        const now = new Date()
        const allPricing = await productRepository.getVariantPricing(variantId,
            {
                id : {
                    [Op.ne] : pricingId
                },
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte]: now
                        }
                    },
                    {
                        validTo : {
                            [Op.is]: null
                        }
                    }
                ]
            })

        // Change Status To False
        if (pricing.isActive && allPricing.length === 0)
            throw new BadRequestError('The Product Requires At Least One Active Pricing')

        if (pricing.isActive) {
            if (!(await productRepository.changeVariantPricingStatus(variantId, pricingId, true)))
                throw new ConflictError('Product Variant Pricing Status Not Changed')
            return
        }
        
        // Change Status To True
        if (pricing.validTo !== null && pricing.validTo.getTime() < now.getTime())
            throw new BadRequestError('An Expired Pricing Cannot Be Activated')

        if (allPricing.length > 0) {
            const hasPriorityOverlap = allPricing.some(
                existingPricing =>
                    existingPricing.priority === pricing.priority &&
                    (
                        (existingPricing.validTo === null || existingPricing.validTo.getTime() >= pricing.validFrom.getTime()) &&
                        (pricing.validTo === null || pricing.validTo.getTime() >= existingPricing.validFrom.getTime())
                    )
            )
            if (hasPriorityOverlap)
                throw new ConflictError('Another Active Pricing With The Same Priority Has An Overlapping Date Range')
        }
        if (!(await productRepository.changeVariantPricingStatus(variantId, pricingId, false)))
            throw new ConflictError('Product Variant Pricing Status Not Changed')
        return
    }

    async deleteVariantPricing (productId : number, variantId : number, pricingId : number)
    {
        // Get Product
        const product = await productRepository.getProduct(productId)
        if (!product)
            throw new NotFoundError(`Product Not Found { ID : ${productId} }`)
        // Get Variant
        const variant = await productRepository.findVariant(variantId, productId)
        if (!variant)
            throw new NotFoundError(`Variant Not Found { ID : ${variantId} }`)
        // Get This Pricing
        const [pricing] = await productRepository.getVariantPricing(variantId, {id : pricingId})
        if (!pricing)
            throw new NotFoundError(`Pricing Not Found { ID : ${pricingId} }`)
        
        // Delete InActive Pricing
        if (!pricing.isActive) {
            if (!(await productRepository.deletePricing(variantId, pricingId)))
                throw new InternalServerError('Product Variant Pricing Not Deleted')
            return
        }
        // Delete Active Pricing
        // Get Other Pricing
        const now = new Date()
        const allPricing = await productRepository.getVariantPricing(variantId,
            {
                id : {
                    [Op.ne] : pricingId
                },
                isActive : true,
                [Op.or] : [
                    {
                        validTo : {
                            [Op.gte] : now
                        }
                    },
                    {
                        validTo : {
                            [Op.is] : null
                        }
                    }
                ]
            })
        
        if (allPricing.length === 0)
            throw new BadRequestError('The Product Requires At Least One Active Pricing')

        if (!(await productRepository.deletePricing(variantId, pricingId)))
            throw new ConflictError('Product Variant Pricing Not Deleted')     
        return   
    }
    
}

export default new AdminProductService()