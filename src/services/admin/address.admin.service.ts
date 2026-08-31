import { AddressQueryBuilder } from "../../builders/addressQuary.builder.js";
import sequelize from "../../configs/sequelize.config.js";
import Address from "../../models/address.model.js";
import addressRepository from "../../repository/address.repository.js";
import adminAuditLogRepository from "../../repository/adminAuditLog.repository.js";
import { AdminAuditAction, AdminAuditEntity } from "../../types/adminAuditLog.enum.js";
import { ConflictError, NotFoundError } from "../../utils/appError.js";
import { AddressDto, AddressesQSDto, ChangeAddressDto } from "../../validation/address.validation.js";

class AdminAddressService {
    async getAllAddresses (qs : AddressesQSDto)
    : Promise<{
        rows: Address[];
        count: number;
    }> {
        // Create Options
        const options = AddressQueryBuilder.build(qs)

        // Get Addresses
        return await addressRepository.getAllAddresses(options)
    }

    async getAddress (addressId : number)
    : Promise<Address> {
        // Get Address
        const address = await addressRepository.getAddress(addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        return address
    }

    async changeAddress (addressId : number, addressData : ChangeAddressDto, adminId : number)
    : Promise<ChangeAddressDto> {
        // Get Address
        const address = await addressRepository.getAddress(addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        // Create Data
        const data : Partial<Pick<Address, 'addressLine' | 'city' | 'postalCode'>> = {}

        if (addressData.addressLine !== undefined)
            data.addressLine = addressData.addressLine

        if (addressData.city !== undefined)
            data.city = addressData.city

        if (addressData.postalCode !== undefined)
            data.postalCode = addressData.postalCode

        await sequelize.transaction(async t => {
            // Change Address
            if (!(await addressRepository.changeAddress(addressId, data, t)))
                throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.UPDATE,
                entityType : AdminAuditEntity.ADDRESS,
                entityId : addressId,
                ipAddress : null,
                reason : null,
                oldValues : {
                    addressLine : address.addressLine,
                    city : address.city,
                    postalCode : address.postalCode
                },
                newValues : data
            }, t)
        })
        
        return data
    }

    async deleteAddress (addressId : number, reason : string, adminId : number)
    : Promise<void> {
        // Get Address
        const address = await addressRepository.getAddress(addressId)
        if (!address)
            throw new NotFoundError(`Address Not Found { ID : ${addressId} }`)

        await sequelize.transaction(async t => {
            // Delete Address
            if (!(await addressRepository.adminDeleteAddress(addressId, t)))
                throw new ConflictError(`Address Not Deleted`)

            // Add Admin Audit
            await adminAuditLogRepository.createAdminAuditLog({
                adminId,
                action : AdminAuditAction.DELETE,
                entityType : AdminAuditEntity.ADDRESS,
                entityId : addressId,
                ipAddress : null,
                reason,
                oldValues : null,
                newValues : null
            }, t)
        })
        
        return
    }
}

export default new AdminAddressService()