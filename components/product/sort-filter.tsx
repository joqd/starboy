import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { ProductOrdering } from "@/lib/api/product"

const SORT_OPTIONS: { value: ProductOrdering; label: string }[] = [
    { value: "created_at", label: "جدیدترین" },
    { value: "-created_at", label: "قدیمی‌ترین" },
    { value: "price", label: "ارزان‌ترین" },
    { value: "-price", label: "گران‌ترین" },
]

export function SortFilter({
    value,
    onChange,
}: {
    value: ProductOrdering
    onChange: (value: ProductOrdering) => void
}) {
    const selectedLabel = SORT_OPTIONS.find((option) => option.value === value)?.label

    return (
        <Select value={value} onValueChange={(next) => onChange(next as ProductOrdering)}>
            <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="مرتب‌سازی">{selectedLabel}</SelectValue>
            </SelectTrigger>

            <SelectContent dir="rtl">
                {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
