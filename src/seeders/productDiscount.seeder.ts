import { ProductDiscount, ProductVariant } from "../models/product.model.js";

export async function productDiscountSeeder() {

    const variants = await ProductVariant.findAll();

    const variantMap = new Map(
        variants.map(variant => [variant.sku, variant.id])
    );

    const discounts = [
        {
            sku: "GR18-Y-215",
            type: "percent",
            value: 10
        },
        {
            sku: "DER18-W-300",
            type: "fixed",
            value: 50000
        },
        {
            sku: "GB21-R-290",
            type: "percent",
            value: 15
        },
        {
            sku: "LDN21-W-850",
            type: "fixed",
            value: 200000
        }
    ] as const;

    const startDate = new Date("2025-01-01");
    const endDate = new Date("2035-12-31");

    for (const discount of discounts) {

        const variantId = variantMap.get(discount.sku);

        if (!variantId)
            continue;

        await ProductDiscount.findOrCreate({
            where: {
                variantId
            },
            defaults: {
                variantId,

                type: discount.type,
                value: discount.value,

                startDate,
                endDate,

                isActive: true
            }
        });

    }

}