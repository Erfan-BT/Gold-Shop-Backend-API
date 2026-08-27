import sequelize from "../configs/sequelize.config.js"
import Address from "../models/address.model.js"
import addressRepository from "../repository/address.repository.js"
import authRepository from "../repository/auth.repository.js"
import userRepository from "../repository/user.repository.js"
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../utils/appError.js"
import { AddressDto, ChangeAddressDto } from "../validation/address.validation.js"

class AddressService {
    async getUserAddresses (userId : number)
    : Promise<Address[]> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get User Addresses
        return await addressRepository.getUserAddresses(userId)
    }

    async getUserAddress (userId : number, addressId : number)
    : Promise<Address> {
        // Get User
        const user = await authRepository.getUserById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get User Address
        const address = await addressRepository.getUserAddress(userId, addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)
        
        return address
    }

    async createAddress (userId : number, addressData : AddressDto)
    : Promise<Address> {
        // Get User
        const user = await userRepository.userById(userId)
        if (!user)
            throw new NotFoundError(`User Not Found { ID : ${userId} }`)

        // Get User Address Count
        const count = await addressRepository.addressCount(userId)
        let isDefault : boolean = false
        if (count === 0)
            isDefault = true

        return await addressRepository.createAddress(userId, addressData, isDefault)
    }

    async changeAddress (userId : number, addressId : number, addressData : ChangeAddressDto)
    : Promise<ChangeAddressDto> {
        // Get Address
        const address = await addressRepository.getUserAddress(userId, addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        // Data
        const data : Partial<Pick<Address, 'addressLine' | 'city' | 'postalCode'>> = {}

        if (addressData.addressLine !== undefined && addressData.addressLine !== address.addressLine)
            data.addressLine = addressData.addressLine

        if (addressData.city !== undefined && addressData.city !== address.city)
            data.city = addressData.city

        if (addressData.postalCode !== undefined && addressData.postalCode !== address.postalCode)
            data.postalCode = addressData.postalCode

        // Change Address
        if (!(await addressRepository.changeUserAddress(userId, addressId, data)))
            throw new ConflictError('Address Not Changed')

        return data
    }

    async setDefaultAddress (userId : number, addressId : number)
    : Promise<void> {
        await sequelize.transaction(async (t) => {
            // Get Address
            const address = await addressRepository.getUserAddress(userId, addressId, t)
            if (!address)
                throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

            if (address.isDefault)
                return

            // Set Default
            await addressRepository.setDefaultAddress(userId, addressId, t)
        })
        return
    }

    async deleteAddress (userId : number, addressId : number)
    : Promise<void> {
        // Get Address
        const address = await addressRepository.getUserAddress(userId, addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        // Delete Address
        if (!(await addressRepository.deleteAddress(userId, addressId)))
            throw new ConflictError('Address Not Deleted')
        return
    }
}

export default new AddressService()