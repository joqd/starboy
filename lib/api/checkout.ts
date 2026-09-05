import request from "@/lib/api/client"
import type { Order } from "@/types/order"
import type { PaymentLink } from "@/types/checkout"

export function createOrder(): Promise<Order> {
    return request<Order>(
        `/api/orders/`,
        {
            method: "POST",
        },
        { auth: true }
    )
}

export function pay(token: string, gatewayId: number): Promise<PaymentLink> {
    return request<PaymentLink>(
        `/api/orders/${token}/pay/`,
        {
            method: "POST",
            body: JSON.stringify({ gatewayId }),
        },
        { auth: true }
    )
}
