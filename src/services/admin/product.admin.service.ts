import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import productRepository from "../../repository/product.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { AdminProductQSDto } from "../../validation/product.validation.js";

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
}

export default new AdminProductService()