import request from "@/lib/api/client"
import type { Order } from "@/types/order"
import type { PaymentLink } from "@/types/checkout"

export interface CreateOrderPayload {
    address_id: number
    customer_note: string
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
    return request<Order>(
        `/api/orders/`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
        { auth: true }
    )
}

export function pay(token: string, gatewayId: number): Promise<PaymentLink> {
    return request<PaymentLink>(
        `/api/orders/${token}/pay/`,
        {
            method: "POST",
            body: JSON.stringify({ gateway_id: gatewayId }),
        },
        { auth: true }
    )
}
