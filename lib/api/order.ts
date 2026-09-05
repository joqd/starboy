import request from "@/lib/api/client"
import type { OrderList, Order } from "@/types/order"

export function getOrders(status: string | null = null): Promise<OrderList> {
    let path = "/api/orders/"

    if (status !== null) {
        path = `/api/orders/?status=${status}`
    }

    return request<OrderList>(
        path,
        {
            method: "GET",
        },
        { auth: true }
    )
}

export function getOrderByToken(token: string): Promise<Order> {
    return request<Order>(
        `/api/orders/${token}/`,
        {
            method: "GET",
        },
        { auth: true }
    )
}
