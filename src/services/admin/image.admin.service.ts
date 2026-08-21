import sequelize from "../../configs/sequelize.config.js"
import imageRepository from "../../repository/image.repository.js"
import productRepository from "../../repository/product.repository.js"
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../utils/appError.js"
import { ImageService } from "../image.service.js"

class AdminImageService {
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
        return await imageRepository.getVariantImages(variantId)
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
                        await imageRepository.createVariantImage(
                            variantId,
                            processedImages[i]!.url,
                            processedImages[i]!.filename,
                            processedImages[i]!.filename,
                            i,
                            i === 0 && !(await imageRepository.hasPrimaryImage(variantId)),
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
        if (!(await imageRepository.changeImageAltText(variantId, imageId, altText)))
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
        const images = await imageRepository.getVariantImages(variantId)
        if (images.length === 0)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        const imageExists = images.some(image => image.id === imageId)
        if (!imageExists)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        // Check Is Primary
        const isPrimary = await imageRepository.isPrimaryImage(variantId, imageId)
        if (isPrimary)
                return
        // Change
        await sequelize.transaction(async t => {
            // Set Variant Images Primary False
            await imageRepository.setVariantImagesPrimaryFalse(variantId, t)
            // Set Image Primary
            if (!(await imageRepository.setVariantImagePrimary(variantId, imageId, t)))
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
        const images = await imageRepository.getVariantImages(variantId)
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
                if (!(await imageRepository.changeImageSortOrder(variantId, imageIds[i]!, i + 1, t)))
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
        const image = await imageRepository.getVariantImage(variantId, imageId)
        if (!image)
            throw new NotFoundError(`Image Not Found { ID : ${imageId} }`)
        if (image.isPrimary)
            throw new ConflictError('Primary Image Can Not Be Deleted')
        // Delete From DB
        if (!(await imageRepository.deleteImage(variantId, imageId)))
            throw new ConflictError('Image Not Deleted')
        // Delete Physical
        await ImageService.deleteImage(image.fileName)
        return
    }
}

export default new AdminImageService()