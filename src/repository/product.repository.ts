import { FindAndCountOptions } from "sequelize";
import { Product } from "../models/product.model.js";

class ProductRepository {
    async getProducts(options: FindAndCountOptions<Product>)
    : Promise<{
        rows: Product[];
        count: number;
    }> {
        return await Product.findAndCountAll(options);
    }
}

export default new ProductRepository()