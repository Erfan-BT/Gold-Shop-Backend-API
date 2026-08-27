export function normalizeIranPhone (phone : string)
: string {
    if (phone.startsWith('+98')) {
        return phone
    }

    if (phone.startsWith('98')) {
        return `+${phone}`
    }

    if (phone.startsWith('0')) {
        return `+98${phone.slice(1)}`
    }

    return `+98${phone}`
}