import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { CollectionListItem } from "@/types/collection"

const ALL_VALUE = "all"

export function CollectionFilter({
    value,
    collections,
    onChange,
}: {
    value: string | null
    collections: CollectionListItem[]
    onChange: (value: string | null) => void
}) {
    const selectedLabel =
        value === null
            ? "همه دسته‌ها"
            : collections.find((collection) => collection.slug === value)?.title

    return (
        <Select
            value={value ?? ALL_VALUE}
            onValueChange={(next) => onChange(next === ALL_VALUE ? null : next)}
        >
            <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="دسته‌بندی">{selectedLabel}</SelectValue>
            </SelectTrigger>

            <SelectContent dir="rtl">
                <SelectItem value={ALL_VALUE}>همه دسته‌ها</SelectItem>

                {collections.map((collection) => (
                    <SelectItem key={collection.slug} value={collection.slug}>
                        {collection.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
