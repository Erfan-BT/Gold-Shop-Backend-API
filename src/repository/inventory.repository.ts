import { literal, Op, Transaction } from "sequelize";
import Inventory from "../models/inventory.model.js"

class InventoryRepository {
    async decreaseStock(
        variantId: number,
        quantity: number,
        transaction: Transaction
    )
    : Promise<boolean> {
        const [rows] = await Inventory.update(
            {
                quantity : literal(`quantity - ${quantity}`)
            },
            {
                where : {
                    variantId,
                    quantity : {
                        [Op.gte] : quantity
                    }
                },
                transaction
            }
        )
        return rows === 1;
    }

    async increaseStock(
        variantId: number,
        quantity: number,
        transaction: Transaction
    )
    : Promise<boolean> {
        const [rows] = await Inventory.update(
            {
                quantity : literal(`quantity + ${quantity}`)
            },
            {
                where : {
                    variantId,
                },
                transaction
            }
        )
        return rows === 1;
    }

    // --- Admin ---
    async getVariantInventory (variantId : number)
    {
        return await Inventory.findOne({
            where : {
                variantId
            },
            attributes : ['id', 'quantity', 'minThreshold']
        })
    }

    async changeInventory (variantId : number, data : Partial<Pick<Inventory, 'quantity' | 'minThreshold'>>)
    {
        const [rows] = await Inventory.update(data, {
            where : {
                variantId
            }
        })
        return rows === 1
    }
}

export default new InventoryRepository()