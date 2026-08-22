import { ReturnQueryBuilder } from "../../builders/returnQuery.builder.js";
import returnRepository from "../../repository/return.repository.js";
import { NotFoundError } from "../../utils/appError.js";
import { ReturnRequestQSDto } from "../../validation/return.validation.js";

class AdminReturnService {
    async getAllReturnRequests (qs : ReturnRequestQSDto)
    {
        const options = ReturnQueryBuilder.build(qs)
        return await returnRepository.getAllReturnRequests(options)
    }

    async getReturnRequest (returnId : number)
    {
        const returnRequest = await returnRepository.getReturnRequest(returnId)
        if (!returnRequest)
            throw new NotFoundError(`Return Request Not Found { ID : ${returnId} }`)
        return returnRequest
    }
}

export default new AdminReturnService()