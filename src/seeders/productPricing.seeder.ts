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

    const validFrom = new Date("2025-01-01");
    const validTo = new Date("2035-12-31");

    for (const variant of variants) {

        const productSlug = variant.product?.slug;

        if (!productSlug)
            continue;

        await ProductPricing.findOrCreate({
            where: {
                variantId: variant.id,
            },
            defaults: {
                variantId: variant.id,

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