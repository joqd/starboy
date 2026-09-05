import Link from "next/link"
import { ChevronLeft, Package, PackageX } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge, ShippingStatusBadge } from "@/components/orders/order-status-badge"
import type { OrderListItem } from "@/types/order"

export function OrderListSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-18 rounded-xl" />
            ))}
        </div>
    )
}

export function OrderListError({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 px-6 py-16 text-center">
            <PackageX className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
    )
}

export function EmptyOrders({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 px-6 py-16 text-center">
            <Package className="size-6 text-muted-foreground" />
            <div>
                <p className="text-sm font-medium text-foreground">
                    {filtered ? "سفارشی با این وضعیت یافت نشد" : "هنوز سفارشی ثبت نکرده‌اید"}
                </p>
                {!filtered && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        سفارش‌های شما پس از ثبت، در همین صفحه نمایش داده می‌شوند.
                    </p>
                )}
            </div>
        </div>
    )
}

export function OrderList({ orders }: { orders: OrderListItem[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {orders.map((order) => (
                <li key={order.token}>
                    <Link
                        href={`/orders/${order.token}`}
                        className="flex items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:border-foreground/30 hover:bg-white/60 dark:hover:bg-accent/60"
                    >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                            <Package className="size-[1.15rem] text-foreground" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <span
                                className="font-inter text-sm font-medium text-foreground"
                                dir="ltr"
                            >
                                {order.order_number}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                <OrderStatusBadge status={order.status} />
                                <ShippingStatusBadge status={order.shipping_status} />
                            </div>
                        </div>

                        <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                </li>
            ))}
        </ul>
    )
}
