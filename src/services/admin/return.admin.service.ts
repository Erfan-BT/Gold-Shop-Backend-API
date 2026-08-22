import { ReturnQueryBuilder } from "../../builders/returnQuery.builder.js";
import returnRepository from "../../repository/return.repository.js";
import { ReturnRequestQSDto } from "../../validation/return.validation.js";

class AdminReturnService {
    async getAllReturnRequests (qs : ReturnRequestQSDto)
    {
        const options = ReturnQueryBuilder.build(qs)
        return await returnRepository.getAllReturnRequests(options)
    }
}

export default new AdminReturnService()