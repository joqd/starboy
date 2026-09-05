import { OrderStatusBadge, ShippingStatusBadge } from "@/components/orders/order-status-badge"
import type { Order } from "@/types/order"

export function OrderHeader({ order }: { order: Order }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    سفارش{" "}
                    <span dir="ltr" className="font-inter">
                        {order.order_number}
                    </span>
                </h1>
                <p className="mt-1.5 text-xs text-muted-foreground">
                    ثبت شده در {formatDate(order.created_at)}
                </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                <OrderStatusBadge status={order.status} />
                <ShippingStatusBadge status={order.shipping_status} />
            </div>
        </div>
    )
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}
