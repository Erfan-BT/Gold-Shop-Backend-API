import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AddressDto, AddressesQSDto, AddressIdDto } from "../../validation/address.validation.js";
import adminAddressService from "../../services/admin/address.admin.service.js";

class AdminAddressController {
    async getAllAddresses (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AddressesQSDto
            const result = await adminAddressService.getAllAddresses(qs)

            res.status(200).json({
                success : true,
                msg : 'All Addresses',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async getAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { addressId } = req.validated.params as AddressIdDto
            const result = await adminAddressService.getAddress(addressId)

            res.status(200).json({
                success : true,
                msg : 'Address',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { addressId } = req.validated.params as AddressIdDto
            const addressData = req.validated.body as AddressDto
            await adminAddressService.changeAddress(addressId, addressData)

            res.status(200).json({
                success : true,
                msg : 'Change Address',
                data : {}
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminAddressController()