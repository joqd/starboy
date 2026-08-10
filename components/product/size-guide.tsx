"use client"

import { useMemo, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { ProductVariant } from "@/types/product"

// ---------- Types ----------
interface SizeGuideColumn {
    key: string
    label: string
}

interface SizeGuideRow {
    size: string
    values: Record<string, string>
}

type Props = {
    variants: ProductVariant[]
}

// ---------- Derivation ----------
// The size guide table is built straight from the variants the product
// already carries (variant.size.attributes) — there's nothing to fetch and
// no loading/error state needed, since this data is present the moment the
// product page renders. One row per distinct size, one column per distinct
// attribute key, ordered by attribute.sort_order.
function buildSizeGuide(variants: ProductVariant[]): {
    columns: SizeGuideColumn[]
    rows: SizeGuideRow[]
} {
    const seenSizes = new Set<string>()
    const columnOrder = new Map<string, number>()
    const rows: SizeGuideRow[] = []

    for (const variant of variants) {
        const { size } = variant
        if (!size || size.attributes.length === 0 || seenSizes.has(size.name)) continue
        seenSizes.add(size.name)

        const values: Record<string, string> = {}
        for (const attr of size.attributes) {
            values[attr.key] = attr.value
            if (!columnOrder.has(attr.key)) columnOrder.set(attr.key, attr.sort_order)
        }
        rows.push({ size: size.label, values })
    }

    const columns = Array.from(columnOrder.entries())
        .sort(([, a], [, b]) => a - b)
        .map(([key]) => ({ key, label: key }))

    return { columns, rows }
}

// ---------- Component ----------

export default function SizeGuide({ variants }: Props) {
    const [open, setOpen] = useState(false)

    // Derived once per `variants` identity, not on every open/close toggle.
    const { columns, rows } = useMemo(() => buildSizeGuide(variants), [variants])

    if (columns.length === 0 || rows.length === 0) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <span>راهنمای سایز</span>
            </DialogTrigger>

            <DialogContent dir="rtl" className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-right">راهنمای سایز</DialogTitle>
                </DialogHeader>

                <div className="overflow-x-auto">
                    <Table dir="rtl">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">سایز</TableHead>
                                {columns.map((col) => (
                                    <TableHead key={col.key} className="text-right">
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.size}>
                                    <TableCell className="font-inter text-right font-medium">
                                        {row.size}
                                    </TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className="font-inter text-right">
                                            {row.values[col.key] ?? "-"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <p className="mt-2 text-right text-xs text-muted-foreground">
                    اندازه ها کاملا دقیق و متناسب با محصول هستند
                </p>
            </DialogContent>
        </Dialog>
    )
}
