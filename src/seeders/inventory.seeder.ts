import Inventory from "../models/inventory.model.js";
import { ProductVariant } from "../models/product.model.js";

export async function inventorySeeder() {

    const variants = await ProductVariant.findAll();

    const variantMap = new Map(
        variants.map(variant => [variant.sku, variant.id])
    );

    const inventories = [
        {
            sku: "GR18-Y-215",
            quantity: 8,
            minThreshold: 2
        },
        {
            sku: "GR18-W-260",
            quantity: 3,
            minThreshold: 2
        },
        {
            sku: "DER18-W-300",
            quantity: 1,
            minThreshold: 1
        },
        {
            sku: "GNC18-Y-500",
            quantity: 0,
            minThreshold: 1
        },
        {
            sku: "MDR18-W-420",
            quantity: 5,
            minThreshold: 2
        },
        {
            sku: "GB18-Y-250",
            quantity: 12,
            minThreshold: 3
        },
        {
            sku: "GB21-R-290",
            quantity: 6,
            minThreshold: 2
        },
        {
            sku: "LDN21-W-850",
            quantity: 2,
            minThreshold: 1
        },
        {
            sku: "LDN24-Y-910",
            quantity: 0,
            minThreshold: 1
        }
    ] as const;

    for (const inventory of inventories) {

        const variantId = variantMap.get(inventory.sku);

        if (!variantId)
            continue;

        await Inventory.findOrCreate({
            where: {
                variantId
            },
            defaults: {
                variantId,
                quantity: inventory.quantity,
                minThreshold: inventory.minThreshold
            }
        });

    }

}