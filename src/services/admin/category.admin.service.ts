import { CategoryQueryBuilder } from "../../builders/categoryQuary.builder.js";
import categoryRepository from "../../repository/category.repository.js";
import { CategoryQSDto, CategorySchemaDto } from "../../validation/category.vallidation.js";

class AdminCategoryService {
    async getAllCategories (qs : CategoryQSDto)
    {
        const options = CategoryQueryBuilder.build(qs)
        return await categoryRepository.getCategories(options)
    }

    async createCategory (categoryData : CategorySchemaDto)
    {
        return await categoryRepository.createCategory(categoryData)
    }
}

export default new AdminCategoryService()