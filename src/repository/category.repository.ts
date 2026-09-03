import { FindAndCountOptions, Transaction } from "sequelize";
import { Category, ProductCategory } from "../models/category.model.js";
import { CategoryDto } from "../validation/category.vallidation.js";

class CategoryRepository {
    async getCategories (options : FindAndCountOptions)
    : Promise<{
        rows: Category[];
        count: number;
    }> {
        return await Category.findAndCountAll(options)
    }

    async getCategory (categoryId : number)
    : Promise<Category | null> {
        return await Category.findByPk(categoryId)
    }

    async getCategoryChildren (categoryId : number)
    : Promise<Category[]> {
        return await Category.findAll({
            where : {
                parentId : categoryId
            }
        })
    }

    async getProductCategories (productId : number)
    : Promise<ProductCategory[]> {
        return await ProductCategory.findAll({
            where: {
                productId
            },
            attributes: ['id'],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: [
                        'id',
                        'title',
                        'slug',
                        'parentId',
                        'isActive'
                    ]
                }
            ]
        })
    }

    async checkExists (productId : number, categoryId : number)
    : Promise<boolean> {
        return await ProductCategory.findOne({
            where : {
                productId,
                categoryId
            }
        }) !== null
    }

    async createCategory (categoryData : CategoryDto)
    : Promise<Category> {
        return await Category.create({
            title : categoryData.title,
            slug : categoryData.slug,
            parentId : categoryData.parentId !== undefined ? categoryData.parentId : null,
            isActive : true
        })
    }

    async changeCategory (categoryId : number, data : Partial<Pick<Category, 'title' | 'slug' | 'parentId'>>, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Category.update(data ,{
            where : {
                id : categoryId
            },
            transaction
        })
        return rows === 1
    }

    async changeCategoryStatus (categoryId : number, currentStatus : boolean, transaction : Transaction)
    : Promise<boolean> {
        const [rows] = await Category.update({
            isActive : !currentStatus
        },{
            where : {
                id : categoryId,
                isActive : currentStatus
            },
            transaction
        })
        return rows === 1
    }

    async deleteCategory (categoryId : number, transaction : Transaction)
    : Promise<boolean> {
        const rows = await Category.destroy({
            where : {
                id : categoryId
            },
            transaction
        })
        return rows === 1
    }

    async setProductCategory (productId : number, categoryId : number, transaction : Transaction)
    : Promise<ProductCategory> {
        return await ProductCategory.create({
            productId,
            categoryId
        }, {
            transaction
        })
    }

    async deleteProductCategory (productId : number, categoryId : number, transaction : Transaction)
    : Promise<boolean> {
        const rows = await ProductCategory.destroy({
            where : {
                productId,
                categoryId
            },
            transaction
        })
        return rows === 1
    }

}

export default new CategoryRepository()