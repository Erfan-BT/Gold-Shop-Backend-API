import { Transaction } from "sequelize"
import { ProductImage } from "../models/product.model.js"

class ImageRepository {
    async getVariantImage (variantId : number, imageId : number)
    {
        return ProductImage.findOne({
            where : {
                variantId,
                id : imageId
            }
        })
    }
    
    async getVariantImages (variantId : number)
    {
        return await ProductImage.findAll({
            where : {
                variantId
            },
            order : [
                ['orderSort', 'ASC']
            ],
            attributes : ['id', 'imageUrl', 'altText', 'isPrimary', 'fileName', 'sortOrder', 'createdAt']
        })
    }

    async createVariantImage (variantId : number, imageUrl : string, fileName : string, altText : string, sortOrder : number, isPrimary : boolean = false)
    {
        return await ProductImage.create({
            variantId,
            altText,
            fileName,
            imageUrl,
            sortOrder,
            isPrimary
        })
    }

    async hasPrimaryImage (variantId : number)
    {
        return await ProductImage.findOne({
            where : {
                variantId,
                isPrimary : true
            }
        }) !== null
    }

    async changeImageAltText (variantId : number, imageId : number, altText : string)
    {
        const [rows] = await ProductImage.update({
            altText,
        },{
            where : {
                id : imageId,
                variantId
            }
        })
        return rows === 1
    }

    async isPrimaryImage (variantId : number, imageId : number, transaction ?: Transaction)
    {
        return await ProductImage.findOne({
            where : {
                variantId,
                id : imageId,
                isPrimary : true
            },
            transaction : transaction ?? null
        }) !== null
    }

    async setVariantImagesPrimaryFalse (variantId : number, transaction : Transaction)
    {
        const [rows] = await ProductImage.update({
            isPrimary : false
        },{
            where : {
                variantId
            },
            transaction
        })
        return rows
    }
    
    async setVariantImagePrimary (variantId : number, imageId : number, transaction : Transaction)
    {
        const [rows] = await ProductImage.update({
            isPrimary : true
        },{
            where : {
                variantId,
                id : imageId
            },
            transaction
        })
        return rows === 1
    }

    async changeImageSortOrder(variantId: number, imageId: number, sortOrder: number, transaction: Transaction)
    {
        const [rows] = await ProductImage.update(
            {
                sortOrder
            },
            {
                where: {
                    id: imageId,
                    variantId
                },
                transaction
            }
        )
        return rows === 1;
    }

    async deleteImage (variantId : number, imageId : number)
    {
        const rows = await ProductImage.destroy({
            where : {
                variantId,
                id : imageId,
                isPrimary : false
            }
        })
        return rows === 1
    }
}

export default new ImageRepository()