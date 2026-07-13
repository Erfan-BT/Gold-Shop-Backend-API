import { Category, ProductCategory } from "../models/category.model.js"

export async function categorySeeder () {
    const [ringCategory] = await Category.findOrCreate({
        where: { slug: 'ring' },
        defaults: {
            title: 'انگشتر',
            slug: 'ring',
            parentId: null,
            isActive: true,
        }
    })

    const [necklaceCategory] = await Category.findOrCreate({
        where: { slug: 'necklace' },
        defaults: {
            title: 'گردنبند',
            slug: 'necklace',
            parentId: null,
            isActive: true,
        }
    })

    const [braceletCategory] = await Category.findOrCreate({
        where: { slug: 'bracelet' },
        defaults: {
            title: 'دستبند',
            slug: 'bracelet',
            parentId: null,
            isActive: false,
        }
    })

    const [goldRingCategory] = await Category.findOrCreate({
        where: { slug: 'gold-ring' },
        defaults: {
            title: 'انگشتر طلا',
            slug: 'gold-ring',
            parentId: ringCategory.dataValues.id,
            isActive: true,
        }
    })

    const [diamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'diamond-ring' },
        defaults: {
            title: 'انگشتر الماس',
            slug: 'diamond-ring',
            parentId: ringCategory.dataValues.id,
            isActive: true,
        }
    })

    const [goldNecklaceCategory] = await Category.findOrCreate({
        where: { slug: 'gold-necklace' },
        defaults: {
            title: 'گردنبند طلا',
            slug: 'gold-necklace',
            parentId: necklaceCategory.dataValues.id,
            isActive: true,
        }
    })

    const [mensDiamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'mens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس مردانه',
            slug: 'mens-diamond-ring',
            parentId: diamondRingCategory.dataValues.id,
            isActive: true,
        }
    })

    const [womensDiamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'womens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس زنانه',
            slug: 'womens-diamond-ring',
            parentId: diamondRingCategory.dataValues.id,
            isActive: true,
        }
    })
}

export async function productCategorySeeder () {
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product1.dataValues.id,
    //         categoryId: ringCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product1.dataValues.id,
    //         categoryId: ringCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product1.dataValues.id,
    //         categoryId: goldRingCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product1.dataValues.id,
    //         categoryId: goldRingCategory.dataValues.id
    //     }
    // })

    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product2.dataValues.id,
    //         categoryId: ringCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product2.dataValues.id,
    //         categoryId: ringCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product2.dataValues.id,
    //         categoryId: diamondRingCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product2.dataValues.id,
    //         categoryId: diamondRingCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product3.dataValues.id,
    //         categoryId: necklaceCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product3.dataValues.id,
    //         categoryId: necklaceCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product3.dataValues.id,
    //         categoryId: goldNecklaceCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product3.dataValues.id,
    //         categoryId: goldNecklaceCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product4.dataValues.id,
    //         categoryId: diamondRingCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product4.dataValues.id,
    //         categoryId: diamondRingCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product5.dataValues.id,
    //         categoryId: braceletCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product5.dataValues.id,
    //         categoryId: braceletCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product6.dataValues.id,
    //         categoryId: necklaceCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product6.dataValues.id,
    //         categoryId: necklaceCategory.dataValues.id
    //     }
    // })
    // await ProductCategory.findOrCreate({
    //     where: {
    //         productId: product6.dataValues.id,
    //         categoryId: goldNecklaceCategory.dataValues.id
    //     },
    //     defaults: {
    //         productId: product6.dataValues.id,
    //         categoryId: goldNecklaceCategory.dataValues.id
    //     }
    // })
}