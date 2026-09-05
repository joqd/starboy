import request from "@/lib/api/client"
import type { OrderList, Order } from "@/types/order"

export function getOrders(
    status: string | null = null,
    page: number = 1,
    pageSize: number = 20
): Promise<OrderList> {
    const params = new URLSearchParams()

    if (status !== null) {
        params.set("status", status)
    }

    params.set("page", page.toString())
    params.set("page_size", pageSize.toString())

    return request<OrderList>(
        `/api/orders/?${params.toString()}`,
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
