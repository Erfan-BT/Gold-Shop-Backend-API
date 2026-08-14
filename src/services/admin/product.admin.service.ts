import { AdminProductQueryBuilder } from "../../builders/adminProductQuery.builder.js";
import productRepository from "../../repository/product.repository.js";
import { AdminProductQSDto } from "../../validation/product.validation.js";

class AdminProductService {
    async getAllProducts (qs : AdminProductQSDto)
    {
        const options = AdminProductQueryBuilder.build(qs)
        return await productRepository.getProducts(options)
    }
}

export default new AdminProductService()