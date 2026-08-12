import { AddressQueryBuilder } from "../../builders/addressQuary.builder.js";
import addressRepository from "../../repository/address.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { AddressesQSDto } from "../../validation/address.validation.js";

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
}

export default new AdminAddressService()