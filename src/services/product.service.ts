import { ProductQueryBuilder } from "../builders/productQuery.builder.js";
import { Product } from "../models/product.model.js";
import productRepository from "../repository/product.repository.js";
import { ProductQSDto } from "../validation/product.validation.js";

class ProductService {
    async allProducts (qs : ProductQSDto)
    : Promise<{
        rows: Product[];
        count: number;
    }> {
        const options = ProductQueryBuilder.build(qs);
        return await productRepository.getProducts(options);
    }
}

export default new ProductService()