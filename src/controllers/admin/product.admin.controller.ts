import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AdminProductQSDto, ChangeProductSchemaDto, ChangeVariantSchemaDto, CreateProductSchemaDto, CreateVariantSchemaDto, ImageAltTextDto, ImageIdsSchemaDto, ProductCategoryIdsDto, ProductIdDto, ProductVariantIdsDto, ProductVariantImageIdsDto } from "../../validation/product.validation.js";
import adminProductService from "../../services/admin/product.admin.service.js";

class AdminProductController {
    async getAllProducts (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AdminProductQSDto
            const result = await adminProductService.getAllProducts(qs)

            res.status(200).json({
                success : true,
                msg : 'Get All Products',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProduct(productId)

            res.status(200).json({
                success : true,
                msg : 'Get Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as CreateProductSchemaDto
            const result = await adminProductService.createProduct(productData)

            res.status(201).json({
                success : true,
                msg : 'Create Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const productData = req.validated.body as ChangeProductSchemaDto
            const { productId } = req.validated.params as ProductIdDto
            await adminProductService.changeProduct(productId, productData)

            res.status(200).json({
                success : true,
                msg : 'Change Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeProductStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.changeProductStatus(productId)

            res.status(200).json({
                success : true,
                msg : 'Change Product Status',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const adminId = req.user!.userId
            await adminProductService.deleteProduct(productId, adminId)

            res.status(200).json({
                success : true,
                msg : 'Delete Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Categories ----------
    async getProductCategories (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProductCategories(productId)

            res.status(200).json({
                success : true,
                msg : 'Product Categories',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async setCategoryForProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, categoryId } = req.validated.params as ProductCategoryIdsDto
            const result = await adminProductService.setCategoryForProduct(productId, categoryId)

            res.status(200).json({
                success : true,
                msg : 'Set Category For Product',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteCategoryFromProduct (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, categoryId } = req.validated.params as ProductCategoryIdsDto
            await adminProductService.deleteCategoryFromProduct(productId, categoryId)

            res.status(200).json({
                success : true,
                msg : 'Delete Category From Product',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Variants ----------
    async getProductVariants (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const result = await adminProductService.getProductVariants(productId)

            res.status(200).json({
                success : true,
                msg : 'Get Product Variants',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId, variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminProductService.getVariant(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Product Variant',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async createVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId } = req.validated.params as ProductIdDto
            const variantData = req.validated.body as CreateVariantSchemaDto
            const result = await adminProductService.createVariant(productId, variantData)

            res.status(201).json({
                success : true,
                msg : 'Create Product Variant',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const variantData = req.validated.body as ChangeVariantSchemaDto
            await adminProductService.changeVariant(productId, variantId, variantData)

            res.status(200).json({
                success : true,
                msg : 'Change Product Variant',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantStatus (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            await adminProductService.changeVariantStatus(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Change Product Variant Status',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteVariant (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const adminId = req.user!.userId
            await adminProductService.deleteVariant(adminId, productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Delete Product Variant',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Images ----------
    async getVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminProductService.getVariantImages(productId, variantId)
            
            res.status(200).json({
                success : true,
                msg : 'Get Variant Images',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async addVariantImages (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const files: Express.Multer.File[] = Array.isArray(req.files) ? req.files : [];
            const result = await adminProductService.addVariantImages(productId, variantId, files)
            
            res.status(201).json({
                success : true,
                msg : 'Add Variant Images',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeImageAltText (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            const { altText } = req.validated.body as ImageAltTextDto
            await adminProductService.changeImageAltText(productId, variantId, imageId, altText)
            
            res.status(200).json({
                success : true,
                msg : 'Change Image Alt Text',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagePrimary (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            await adminProductService.changeVariantImagePrimary(productId, variantId, imageId)
            
            res.status(200).json({
                success : true,
                msg : 'Change Variant Image Primary',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async changeVariantImagesOrder (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const { imageIds } = req.validated.body as ImageIdsSchemaDto
            await adminProductService.changeVariantImagesOrder(productId, variantId, imageIds)
            
            res.status(200).json({
                success : true,
                msg : 'Change Variant Images Order',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteImage (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId, imageId } = req.validated.params as ProductVariantImageIdsDto
            await adminProductService.deleteImage(productId, variantId, imageId)
            
            res.status(200).json({
                success : true,
                msg : 'Delete Variant Image',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }

    // ---------- Pricing ----------
    async getVariantPricing (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { productId , variantId } = req.validated.params as ProductVariantIdsDto
            const result = await adminProductService.getVariantPricing(productId, variantId)

            res.status(200).json({
                success : true,
                msg : 'Get Variant Pricing',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

}

export default new AdminProductController()