import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import { Product } from "../../models/product.model.js";
import productRepository from "../../repository/product.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto, ChangeProductSchemaDto, CreateProductSchemaDto } from "../../validation/product.validation.js";

class AdminProductService {
    async getAllProducts (qs : AdminProductQSDto)
    {
        const options = AdminProductQueryBuilder.build(qs)
        return await productRepository.getProducts(options)
    }

    async getProduct (productId : number)
    {
        const product = await productRepository.getProduct(productId)
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
}

export default new AdminProductService()