export interface AddressList {
    count: number
    next: string | null
    previous: string | null
    results: AddressListItem[]
}

export interface AddressListItem {
    id: number
    title: string
    recipient_name: string
    phone: string
    province: Province
    city: City
    postal_code: string
    address_line: string
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface Address {
    title: string
    recipient_name: string
    phone: string
    province: number // province_id
    city: number // city_id
    postal_code: string
    address_line: string
    is_default: boolean
}

export interface Province {
    id: number
    name: string
}

export interface City {
    id: number
    name: string
}
