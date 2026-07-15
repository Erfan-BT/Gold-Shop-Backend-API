import { Product, ProductVariant } from "../models/product.model.js";
import { ProductKarat } from "../types/product.enum.js";

export async function productVariantSeeder() {

    const products = await Product.findAll();

    const productMap = new Map(
        products.map(product => [product.slug, product])
    );

    const variants = [
        {
            productSlug: "gold-ring-18k",
            sku: "GR18-Y-215",
            weight: 2.15,
            karat: ProductKarat.KARAT_18,
            color: "Yellow",
            stoneType: null,
            soldCount: 10,
            currentPrice: 130000,
            isActive: true
        },
        {
            productSlug: "gold-ring-18k",
            sku: "GR18-W-260",
            weight: 2.60,
            karat: ProductKarat.KARAT_18,
            color: "White",
            stoneType: null,
            soldCount: 5,
            currentPrice: 145000,
            isActive: true
        },

        {
            productSlug: "diamond-engagement-ring",
            sku: "DER18-W-300",
            weight: 3.00,
            karat: ProductKarat.KARAT_18,
            color: "White",
            stoneType: "Diamond",
            soldCount: 2,
            currentPrice: 1300,
            isActive: true
        },

        {
            productSlug: "gold-necklace-classic",
            sku: "GNC18-Y-500",
            weight: 5.00,
            karat: ProductKarat.KARAT_18,
            color: "Yellow",
            stoneType: null,
            soldCount: 4,
            currentPrice: 15000,
            isActive: false
        },

        {
            productSlug: "mens-diamond-ring",
            sku: "MDR18-W-420",
            weight: 4.20,
            karat: ProductKarat.KARAT_18,
            color: "White",
            stoneType: "Diamond",
            soldCount: 0,
            currentPrice: 139000,
            isActive: true
        },

        {
            productSlug: "gold-bracelet",
            sku: "GB18-Y-250",
            weight: 2.50,
            karat: ProductKarat.KARAT_18,
            color: "Yellow",
            stoneType: null,
            soldCount: 10,
            currentPrice: 100000,
            isActive: true
        },
        {
            productSlug: "gold-bracelet",
            sku: "GB21-R-290",
            weight: 2.90,
            karat: ProductKarat.KARAT_21,
            color: "Rose Gold",
            stoneType: null,
            soldCount: 5,
            currentPrice: 120000,
            isActive: true
        },

        {
            productSlug: "luxury-diamond-necklace",
            sku: "LDN21-W-850",
            weight: 8.50,
            karat: ProductKarat.KARAT_21,
            color: "White",
            stoneType: "Diamond",
            soldCount: 3,
            currentPrice: 13000,
            isActive: true
        },
        {
            productSlug: "luxury-diamond-necklace",
            sku: "LDN24-Y-910",
            weight: 9.10,
            karat: ProductKarat.KARAT_24,
            color: "Yellow",
            stoneType: "Diamond",
            soldCount: 2,
            currentPrice: 18000,
            isActive: true
        }
    ];

    for (const variant of variants) {

        const product = productMap.get(variant.productSlug);

        if (!product)
            continue;

        await ProductVariant.findOrCreate({
            where: {
                sku: variant.sku
            },
            defaults: {
                productId: product.id,
                sku: variant.sku,
                weight: variant.weight,
                karat: variant.karat,
                color: variant.color,
                stoneType: variant.stoneType,
                soldCount: variant.soldCount,
                currentPrice: variant.currentPrice,
                isActive: variant.isActive
            }
        });

    }

}