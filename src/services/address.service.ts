import sequelize from "../configs/sequelize.config.js"
import Address from "../models/address.model.js"
import addressRepository from "../repository/address.repository.js"
import userRepository from "../repository/user.repository.js"
import { BadRequestError, InternalServerError } from "../utils/appError.js"
import { AddressDto } from "../validation/address.validation.js"

class AddressService {
    async userAddresses (userId : number)
    : Promise<Address[]> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError()
        // Get User Addresses
        const addresses = await addressRepository.userAddresses(userId)
        
        return addresses as Address[]
    }

    async userAddressById (userId : number, addressId : number)
    : Promise<Address> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError()
        // Get User Address
        const address = await addressRepository.userAddressById(userId, addressId)
        if (!address)
            throw new BadRequestError('Address Not Found')
        
        return address as Address
    }

    async createAddress (userId : number, addressData : AddressDto)
    : Promise<Address> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new BadRequestError()
        // Get User Address Count
        const count = await addressRepository.addressCount(userId)
        let address : Address;
        if (count === 0) {
            // Default Address
            address = await addressRepository.createAddress(userId, addressData, true)
        } else {
            // Not Default
            address = await addressRepository.createAddress(userId, addressData)
        }

        return address
    }

    async updateAddressInfo (userId : number, addressId : number, addressData : AddressDto)
    : Promise<Address> {
        // Get Address
        const address = await addressRepository.userAddressById(userId, addressId)
        if (!address)
            throw new BadRequestError('Address Not Found')
        // Update Address
        await addressRepository.updateAddress(userId, addressId, addressData)
        return (await addressRepository.userAddressById(userId, addressId)) as Address
    }

    async setDefaultAddress (userId : number, addressId : number)
    : Promise<void> {
        await sequelize.transaction(async (t) => {
            // Get Address
            const address = await addressRepository.userAddressById(userId, addressId, t)
            if (!address)
                throw new BadRequestError('Address Not Found')
            if (address.isDefault)
                return
            // Set Default
            await addressRepository.setDefaultAddress(userId, addressId, t)
        })
    }

    async deleteAddress (userId : number, addressId : number)
    : Promise<void> {
        // Get Address
        const address = await addressRepository.userAddressById(userId, addressId)
        if (!address)
            throw new BadRequestError('Address Not Found')
        // Delete Address
        const rows = await addressRepository.deleteAddress(userId, addressId)
        if (rows === 0)
            throw new InternalServerError('Address Not Deleted, Please Try Again Late')
    }
}

export default new AddressService()