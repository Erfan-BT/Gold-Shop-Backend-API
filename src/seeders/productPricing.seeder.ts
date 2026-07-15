import { Category } from "../models/category.model.js";
import {
    ProductPricing,
    ProductVariant
} from "../models/product.model.js";

export async function productPricingSeeder() {

    const variants = await ProductVariant.findAll({
        include: {
            association: "product"
        }
    });

    const categories = await Category.findAll();

    const categoryMap = new Map(
        categories.map(category => [category.slug, category.id])
    );

    const categoryByProductSlug: Record<string, string> = {
        "gold-ring-18k": "gold-ring",
        "diamond-engagement-ring": "womens-diamond-ring",
        "gold-necklace-classic": "gold-necklace",
        "mens-diamond-ring": "mens-diamond-ring",
        "gold-bracelet": "bracelet",
        "luxury-diamond-necklace": "gold-necklace"
    };

    const validFrom = new Date("2025-01-01");
    const validTo = new Date("2035-12-31");

    for (const variant of variants) {

        const productSlug = variant.product?.slug;

        if (!productSlug)
            continue;

        const categorySlug = categoryByProductSlug[productSlug];

        if (!categorySlug)
            continue;

        const categoryId = categoryMap.get(categorySlug);

        if (!categoryId)
            continue;

        await ProductPricing.findOrCreate({
            where: {
                variantId: variant.id,
                categoryId
            },
            defaults: {
                variantId: variant.id,
                categoryId,

                wageType: "percent",
                wageValue: 7,

                profitType: "percent",
                profitValue: 12,

                taxPercent: 10,

                priority: 1,

                validFrom,
                validTo,

                isActive: true
            }
        });

    }

}