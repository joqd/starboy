import { Badge } from "@/components/ui/badge"
import type { OrderStatus, ShippingStatus } from "@/types/order"

const orderStatusMap: Record<OrderStatus, { label: string; className: string }> = {
    pending_payment: {
        label: "در انتظار پرداخت",
        className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    processing: {
        label: "در حال پردازش",
        className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    paid: {
        label: "پرداخت شده",
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    cancelled: {
        label: "لغو شده",
        className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
    expired: {
        label: "منقضی شده",
        className: "border-border bg-muted text-muted-foreground",
    },
    refunded: {
        label: "بازگشت وجه",
        className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
}

const shippingStatusMap: Record<ShippingStatus, { label: string; className: string }> = {
    pending: {
        label: "در انتظار ارسال",
        className: "border-border bg-muted text-muted-foreground",
    },
    processing: {
        label: "در حال آماده‌سازی",
        className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    shipped: {
        label: "ارسال شده",
        className: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    delivered: {
        label: "تحویل داده شده",
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    returned: {
        label: "مرجوع شده",
        className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
}

/** Used to build the status filter chips — keeps the label source in one place. */
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
    Object.keys(orderStatusMap) as OrderStatus[]
).map((value) => ({ value, label: orderStatusMap[value].label }))

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const meta = orderStatusMap[status]
    return (
        <Badge variant="outline" className={meta.className}>
            {meta.label}
        </Badge>
    )
}

export function ShippingStatusBadge({ status }: { status: ShippingStatus }) {
    const meta = shippingStatusMap[status]
    return (
        <Badge variant="outline" className={meta.className}>
            {meta.label}
        </Badge>
    )
}
