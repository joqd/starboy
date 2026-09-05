import type { AddressListItem } from "./address"

export interface OrderList {
    count: number
    next: string | null
    previous: string | null
    results: OrderListItem[]
}

export type OrderStatus =
    "pending_payment" | "processing" | "paid" | "cancelled" | "expired" | "refunded"

export type ShippingStatus = "pending" | "processing" | "shipped" | "delivered" | "returned"

export interface OrderListItem {
    token: string
    order_number: string
    status: OrderStatus
    shipping_status: ShippingStatus
}

export interface Order {
    token: string
    order_number: string
    status: OrderStatus
    shipping_status: ShippingStatus
    subtotal_amount: number
    shipping_amount: number
    discount_amount: number
    total_amount: number
    tracking_code: string
    shipping_company: string
    customer_note: string
    expires_at: string
    paid_at: string
    is_payable: boolean
    is_expired: boolean
    created_at: string
    address: AddressListItem
    items: OrderItem[]
}

interface OrderItem {
    id: number
    title: string
    sku: string
    quantity: number
    unit_price: number
    total_price: number
    image: string
}
