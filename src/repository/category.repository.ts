import { FindAndCountOptions } from "sequelize";
import { Category } from "../models/category.model.js";
import { CategorySchemaDto } from "../validation/category.vallidation.js";

class CategoryRepository {
    async getCategories (options : FindAndCountOptions)
    {
        return await Category.findAndCountAll(options)
    }

    async createCategory (categoryData : CategorySchemaDto)
    {
        return await Category.create({
            ...categoryData,
            isActive : true
        })
    }
}

export default new CategoryRepository()