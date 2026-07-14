import Address from "../models/address.model.js";

export async function addressSeeder () {
    const [address1] = await Address.findOrCreate({
        where: { id : 1 },
        defaults: {
            userId : 1,
            addressLine : "Adrs 1",
            city : "yazd",
            postalCode : "123",
            isDefault : false,
        }
    })
    const [address2] = await Address.findOrCreate({
        where: { id : 2 },
        defaults: {
            userId : 1,
            addressLine : "Adrs 2",
            city : "yazd",
            postalCode : "1234",
            isDefault : true,
        }
    })
    const [address3] = await Address.findOrCreate({
        where: { id : 3 },
        defaults: {
            userId : 1,
            addressLine : "Adrs 3",
            city : "yazd",
            postalCode : "12345",
            isDefault : false,
        }
    })
    const [address4] = await Address.findOrCreate({
        where: { id : 4 },
        defaults: {
            userId : 2,
            addressLine : "Adrs 4",
            city : "shiraz",
            postalCode : "321",
            isDefault : true,
        }
    })
}