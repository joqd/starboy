import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type FeaturedFilterValue = "featured" | "regular" | null

const ALL_VALUE = "all"

const FEATURED_OPTIONS: { value: Exclude<FeaturedFilterValue, null>; label: string }[] = [
    { value: "featured", label: "ویژه" },
    { value: "regular", label: "عادی" },
]

export function FeaturedFilter({
    value,
    onChange,
}: {
    value: FeaturedFilterValue
    onChange: (value: FeaturedFilterValue) => void
}) {
    const selectedLabel =
        value === null
            ? "همه محصولات"
            : FEATURED_OPTIONS.find((option) => option.value === value)?.label

    return (
        <Select
            value={value ?? ALL_VALUE}
            onValueChange={(next) =>
                onChange(next === ALL_VALUE ? null : (next as Exclude<FeaturedFilterValue, null>))
            }
        >
            <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="ویژه">{selectedLabel}</SelectValue>
            </SelectTrigger>

            <SelectContent dir="rtl">
                <SelectItem value={ALL_VALUE}>همه محصولات</SelectItem>

                {FEATURED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
