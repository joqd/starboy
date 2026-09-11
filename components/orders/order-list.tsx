import { Link } from "next-view-transitions"
import { CalendarDays, ChevronLeft, Package, PackageX } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge, ShippingStatusBadge } from "@/components/orders/order-status-badge"
import { OrderCountdown } from "@/components/orders/order-countdown"
import type { OrderListItem } from "@/types/order"

// "fa-IR" already formats with the Persian calendar and Persian digits in
// modern engines, so no extra digit conversion is needed here.
function formatOrderDate(isoDate: string) {
    try {
        return new Intl.DateTimeFormat("fa-IR", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(isoDate))
    } catch {
        return null
    }
}

export function OrderListSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
        </div>
    )
}

export function OrderListError({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-background px-6 py-16 text-center">
            <PackageX className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
    )
}

export function EmptyOrders({ filtered }: { filtered: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
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
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {orders.map((order) => {
                const createdAtLabel = formatOrderDate(order.created_at)

                return (
                    <li key={order.token}>
                        <Link
                            href={`/orders/${order.token}`}
                            className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-foreground/30 hover:bg-white/60 sm:p-5 dark:hover:bg-accent/60"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent">
                                    <Package className="size-5 text-foreground" />
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <span className="text-sm font-semibold text-foreground">
                                        شماره سفارش:{" "}
                                        <span className="font-inter">{order.order_number}</span>
                                    </span>

                                    {createdAtLabel && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarDays className="size-3.5" />
                                            {createdAtLabel}
                                        </span>
                                    )}
                                </div>

                                <ChevronLeft className="size-4 shrink-0 self-start text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-foreground" />
                            </div>

                            {/* Badges sit on one side and the countdown (when
                                relevant) on the other, on the same row - no
                                reserved empty space, so orders without an
                                expiry never look lopsided next to ones that
                                have a countdown. */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <OrderStatusBadge status={order.status} />
                                    <ShippingStatusBadge status={order.shipping_status} />
                                </div>

                                {order.is_payable && !order.is_expired && (
                                    <OrderCountdown expiresAt={order.expires_at} />
                                )}
                            </div>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
