import { FindAndCountOptions, Transaction } from "sequelize"
import Address from "../models/address.model.js"
import { AddressDto } from "../validation/address.validation.js"
import User from "../models/user.model.js"
import { Order } from "../models/order.model.js"

class AddressRepository {
    async getUserAddresses (userId : number)
    : Promise<Address[]> {
        return await Address.findAll({
            where : {
                userId
            },
            attributes : [
                'id',
                'addressLine',
                'city',
                'postalCode',
                'isDefault',
                'createdAt',
            ]
        })
    }

    async getUserAddress (userId : number, addressId : number, transaction ?: Transaction)
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

    async changeUserAddress (userId : number, addressId : number, data : Partial<Pick<Address, 'addressLine' | 'city' | 'postalCode'>>)
    :  Promise<boolean> {
        const [rows] = await Address.update(data, {
            where : {
                id : addressId,
                userId
            }
        })
        return rows === 1
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
    : Promise<boolean> {
        const rows = await Address.destroy({
            where : {
                userId,
                id : addressId
            }
        })
        return rows === 1
    }

    // ----- Admin -----
    async getAllAddresses (options : FindAndCountOptions)
    {
        return await Address.findAndCountAll(options)
    }

    async getAddress (addressId : number)
    {
        return await Address.findOne({
            where : {
                id : addressId
            },
            attributes : ['id', 'addressLine', 'city', 'postalCode', 'isDefault', 'createdAt'],
            include : [
                {
                    model : User,
                    as : 'user',
                    attributes : ['id', 'name', 'email', 'phone']
                },
                {
                    model: Order,
                    as: 'orders',
                    attributes: [
                        'orderNumber',
                        'finalPrice',
                        'status',
                        'paymentStatus',
                        'createdAt'
                    ],
                    limit: 5,
                    separate: true,
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }
            ]
        })
    }

    async changeAddress (addressId : number, addressData : AddressDto)
    {
        const [rows] = await Address.update(addressData, {
            where : {
                id : addressId
            }
        })
        return rows === 1
    }

    async adminDeleteAddress (addressId : number)
    {
        const rows = await Address.destroy({
            where : {
                id : addressId
            }
        })
        return rows === 1
    }
}

export default new AddressRepository()