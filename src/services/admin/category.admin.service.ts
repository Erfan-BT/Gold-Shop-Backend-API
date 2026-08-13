import { CategoryQueryBuilder } from "../../builders/categoryQuary.builder.js";
import categoryRepository from "../../repository/category.repository.js";
import { ConflictError, NotFoundError } from "../../utils/appError.js";
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

    async changeCategory (categoryId : number, categoryData : CategorySchemaDto)
    {
        // Check ParentId
        const parentId = categoryData.parentId
        if (parentId !== null && parentId !== undefined) {
            if (parentId === categoryId)
                throw new ConflictError('Category Can Not Be Its Own Parent')
            // Get Category
            const parentCategory = await categoryRepository.getCategory(parentId)
            if (!parentCategory)
                throw new NotFoundError(`Parent Category Not Found { ID : ${parentId} }`)
        }
        // Change Category
        if (!(await categoryRepository.changeCategory(categoryId, categoryData)))
            throw new NotFoundError(`Category Not Found { ID : ${categoryId} }`)
        return
    }

    async changeCategoryStatus (categoryId : number)
    {
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${category} }`)

        // Change Category Status
        if (!(await categoryRepository.changeCategoryStatus(categoryId, category.isActive)))
            throw new ConflictError('Category Status Not Changed')
        return
    }

    async getCategoryChildren (categoryId : number)
    {
        // Get Category
        const category = await categoryRepository.getCategory(categoryId)
        if (!category)
            throw new NotFoundError(`Category Not Found { ID : ${category} }`)

        // Get Children
        return await categoryRepository.getCategoryChildren(categoryId)

    }
}

export default new AdminCategoryService()