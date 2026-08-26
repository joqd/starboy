import request from "@/lib/api/client"
import type { AddressList, AddressListItem, Address } from "@/types/address"
import type { ProvinceList, CityList } from "@/types/address"

export function getAddressList(): Promise<AddressList> {
    return request<AddressList>(
        "/api/auth/addresses/",
        {
            method: "GET",
        },
        { auth: true }
    )
}

export function getAddress(id: number): Promise<AddressListItem> {
    return request<AddressListItem>(
        `/api/auth/addresses/${id}`,
        {
            method: "GET",
        },
        { auth: true }
    )
}

export function deleteAddress(id: number): Promise<void> {
    return request<void>(
        `/api/auth/addresses/${id}`,
        {
            method: "DELETE",
        },
        { auth: true }
    )
}

export function getProvinces(): Promise<ProvinceList> {
    return request<ProvinceList>(`/api/auth/provinces/`, {
        method: "GET",
    })
}

export function getCities(province_id: number): Promise<CityList> {
    return request<CityList>(`/api/auth/provinces/${province_id}/cities/`, {
        method: "GET",
    })
}

export function createAddress(address: Address): Promise<Address> {
    return request<Address>(
        `/api/auth/addresses/`,
        {
            method: "POST",
            body: JSON.stringify(address),
        },
        { auth: true }
    )
}

export function updateAddress(id: number, address: Address): Promise<Address> {
    return request<Address>(
        `/api/auth/addresses/${id}/`,
        {
            method: "PUT",
            body: JSON.stringify(address),
        },
        { auth: true }
    )
}
