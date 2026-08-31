import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { AddressDto, AddressesQSDto, AddressIdDto, ChangeAddressDto } from "../../validation/address.validation.js";
import adminAddressService from "../../services/admin/address.admin.service.js";
import { ReasonDto } from "../../validation/adminAudit.validation.js";

class AdminAddressController {
    async getAllAddresses (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const qs = req.validated.query as AddressesQSDto
            const result = await adminAddressService.getAllAddresses(qs)

            res.status(200).json({
                success : true,
                msg : 'All Addresses Successfully Found',
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
                msg : 'Address Successfully Found',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async changeAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { addressId } = req.validated.params as AddressIdDto
            const addressData = req.validated.body as ChangeAddressDto
            const adminId = req.user!.userId
            const result = await adminAddressService.changeAddress(addressId, addressData, adminId)

            res.status(200).json({
                success : true,
                msg : 'Address Successfully Chaged',
                data : result
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteAddress (req : AuthRequest, res : Response, next : NextFunction) {
        try {
            const { addressId } = req.validated.params as AddressIdDto
            const { reason } = req.validated.body as ReasonDto
            const adminId = req.user!.userId
            await adminAddressService.deleteAddress(addressId, reason, adminId)

            res.status(200).json({
                success : true,
                msg : 'Address Successfully Deleted',
                data : null
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new AdminAddressController()