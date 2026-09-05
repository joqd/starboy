import { cn } from "@/lib/utils"
import { ORDER_STATUS_OPTIONS } from "@/components/orders/order-status-badge"
import type { OrderStatus } from "@/types/order"

export function StatusFilter({
    value,
    onChange,
}: {
    value: OrderStatus | null
    onChange: (value: OrderStatus | null) => void
}) {
    const options: { value: OrderStatus | null; label: string }[] = [
        { value: null, label: "همه سفارش‌ها" },
        ...ORDER_STATUS_OPTIONS,
    ]

    return (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
            {options.map((option) => {
                const active = option.value === value
                return (
                    <button
                        key={option.label}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                            active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
