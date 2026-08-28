import { ProductQueryBuilder } from "../builders/productQuery.builder.js";
import { Product } from "../models/product.model.js";
import productRepository from "../repository/product.repository.js";
import { NotFoundError } from "../utils/appError.js";
import { ProductQSDto } from "../validation/product.validation.js";

class ProductService {
    async getAllProducts (qs : ProductQSDto)
    : Promise<{
        rows: Product[];
        count: number;
    }> {
        // Create Options
        const options = ProductQueryBuilder.build(qs);
        // Get Products
        return await productRepository.getAllProducts(options);
    }

    async getProductBySlug (slug : string)
    : Promise<Product> {
        // Get Product
        const product = await productRepository.getProductBySlug(slug)
        if (!product)
            throw new NotFoundError(`Product Not Found { Slug : ${slug} }`)
        return product
    }


}

export default new ProductService()