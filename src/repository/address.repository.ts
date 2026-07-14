import { Transaction } from "sequelize"
import sequelize from "../configs/sequelize.config.js"
import Address from "../models/address.model.js"
import { AddressDto } from "../validation/address.validation.js"

class AddressRepository {
    async userAddresses (userId : number)
    : Promise<Address[]> {
        return await Address.findAll({
            where : {
                userId
            }
        })
    }

    async userAddressById (userId : number, addressId : number, transaction ?: Transaction)
    : Promise<Address | null> {
        return await Address.findOne({
            where : {
                userId,
                id : addressId
            },
            ...(transaction && {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
        })
    }

    async addressCount (userId : number)
    : Promise<number> {
        return await Address.count({
            where : {
                userId
            }
        })
    }

    async createAddress (userId : number, addressData : AddressDto, isDefault : boolean = false)
    : Promise<Address> {
        return await Address.create({
            userId,
            addressLine : addressData.addressLine,
            city : addressData.city,
            postalCode : addressData.postalCode,
            isDefault
        })
    }

    async updateAddress (userId : number, addressId : number, addressData : AddressDto)
    :  Promise<number> {
        const [rows] = await Address.update(addressData, {
            where : {
                id : addressId,
                userId
            }
        })
        return rows
    }

    async setDefaultAddress (userId : number, addressId : number, transaction : Transaction)
    : Promise<void> {
        // Set All Address To Not Default
        await Address.update({
            isDefault : false
        }, {
            where : {
                userId,
                isDefault : true
            },
            transaction
        })
        // Set Default
        await Address.update({
            isDefault : true
        }, {
            where : {
                userId,
                id : addressId
            },
            transaction
        })
    }

    async deleteAddress (userId : number, addressId : number)
    : Promise<number> {
        return await Address.destroy({
            where : {
                userId,
                id : addressId
            }
        })
    }
}

export default new AddressRepository()