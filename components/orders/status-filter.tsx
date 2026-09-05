import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ORDER_STATUS_OPTIONS } from "@/components/orders/order-status-badge"
import type { OrderStatus } from "@/types/order"

const ALL_VALUE = "all"

export function StatusFilter({
    value,
    onChange,
}: {
    value: OrderStatus | null
    onChange: (value: OrderStatus | null) => void
}) {
    const selectedLabel =
        value === null
            ? "همه سفارش‌ها"
            : ORDER_STATUS_OPTIONS.find((option) => option.value === value)?.label

    return (
        <Select
            value={value ?? ALL_VALUE}
            onValueChange={(next) => onChange(next === ALL_VALUE ? null : (next as OrderStatus))}
        >
            <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="وضعیت سفارش">{selectedLabel}</SelectValue>
            </SelectTrigger>

            <SelectContent dir="rtl">
                <SelectItem value={ALL_VALUE}>همه سفارش‌ها</SelectItem>

                {ORDER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
