import { AddressQueryBuilder } from "../../builders/addressQuary.builder.js";
import addressRepository from "../../repository/address.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { AddressDto, AddressesQSDto } from "../../validation/address.validation.js";

class AdminAddressService {
    async getAllAddresses (qs : AddressesQSDto)
    {
        const options = AddressQueryBuilder.build(qs)
        return await addressRepository.getAllAddresses(options)
    }

    async getAddress (addressId : number)
    {
        const address = await addressRepository.getAddress(addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)
        return address
    }

    async changeAddress (addressId : number, addressData : AddressDto)
    {
        if (!(await addressRepository.changeAddress(addressId, addressData)))
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)
        return
    }

    async deleteAddress (addressId : number)
    {
        if (!(await addressRepository.adminDeleteAddress(addressId)))
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)
        return
    }
}

export default new AdminAddressService()