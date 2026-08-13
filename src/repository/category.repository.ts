import { FindAndCountOptions } from "sequelize";
import { Category } from "../models/category.model.js";
import { CategorySchemaDto } from "../validation/category.vallidation.js";

class CategoryRepository {
    async getCategories (options : FindAndCountOptions)
    {
        return await Category.findAndCountAll(options)
    }

    async getCategory (categoryId : number)
    {
        return await Category.findByPk(categoryId)
    }

    async createCategory (categoryData : CategorySchemaDto)
    {
        return await Category.create({
            title : categoryData.title,
            slug : categoryData.slug,
            parentId : categoryData.parentId !== undefined ? categoryData.parentId : null,
            isActive : true
        })
    }

    async changeCategory (categoryId : number, categoryData : CategorySchemaDto)
    {
        const [rows] = await Category.update({
            title : categoryData.title,
            slug : categoryData.slug,
            ...(categoryData.parentId !== undefined ? { parentId : categoryData.parentId } : {})
        },{
            where : {
                id : categoryId
            }
        })
        return rows === 1
    }

    async changeCategoryStatus (categoryId : number, currentStatus : boolean)
    {
        const [rows] = await Category.update({
            isActive : !currentStatus
        },{
            where : {
                id : categoryId,
                isActive : currentStatus
            }
        })
        return rows === 1
    }
}

export default new CategoryRepository()