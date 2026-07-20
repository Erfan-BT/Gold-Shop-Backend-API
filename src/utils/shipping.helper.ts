import { ShippingCost, ShippingMethod } from "../types/order.enum.js";

class ShippingHelper {
    calculateShippingCost (shippingMethod : ShippingMethod)
    {
        let shippingCost : number = 0
        switch (shippingMethod) {
            case ShippingMethod.POST:
                shippingCost = ShippingCost.POST
                break
            case ShippingMethod.TIPAX:
                shippingCost = ShippingCost.TIPAX
                break
            default:
                break
        }
        return shippingCost
    }
}

export default new ShippingHelper()