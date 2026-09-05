import type { Order } from "@/types/order"

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

export function OrderTotals({ order }: { order: Order }) {
    return (
        <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
                <span>جمع جزء</span>
                <span className="text-foreground">{formatToman(order.subtotal_amount)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
                <span>هزینه ارسال</span>
                <span className="text-foreground">{formatToman(order.shipping_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>تخفیف</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                        -{formatToman(order.discount_amount)}
                    </span>
                </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 text-base font-bold text-foreground">
                <span>مبلغ قابل پرداخت</span>
                <span>{formatToman(order.total_amount)}</span>
            </div>
        </div>
    )
}
