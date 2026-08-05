"use client"

import { useEffect, useState } from "react"
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
import { Loader2 } from "lucide-react"

// ---------- Types ----------
interface SizeGuideColumn {
    key: string
    label: string
}

interface SizeGuideRow {
    size: string
    values: Record<string, string>
}

interface SizeGuideData {
    columns: SizeGuideColumn[]
    rows: SizeGuideRow[]
}

// ---------- API layer ----------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchSizeGuide(): Promise<SizeGuideData> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
        columns: [
            { key: "chest", label: "دور سینه" },
            { key: "waist", label: "دور کمر" },
            { key: "length", label: "قد" },
        ],
        rows: [
            { size: "S", values: { chest: "88-92", waist: "72-76", length: "66" } },
            { size: "M", values: { chest: "93-97", waist: "77-81", length: "68" } },
            { size: "L", values: { chest: "98-104", waist: "82-88", length: "70" } },
            { size: "XL", values: { chest: "105-111", waist: "89-95", length: "72" } },
        ],
    }
}

// ---------- Component ----------

export default function SizeGuide() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<SizeGuideData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open || data) return

        let cancelled = false
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        setError(null)

        fetchSizeGuide()
            .then((result) => {
                if (!cancelled) setData(result)
            })
            .catch(() => {
                if (!cancelled) setError("دریافت راهنمای سایز با خطا مواجه شد.")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [open, data])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <span>راهنمای سایز</span>
            </DialogTrigger>

            <DialogContent dir="rtl" className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-right">راهنمای سایز</DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">در حال دریافت اطلاعات...</span>
                    </div>
                )}

                {error && <p className="py-4 text-right text-sm text-destructive">{error}</p>}

                {!loading && !error && data && (
                    <>
                        <div className="overflow-x-auto">
                            <Table dir="rtl">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">سایز</TableHead>
                                        {data.columns.map((col) => (
                                            <TableHead key={col.key} className="text-right">
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.rows.map((row) => (
                                        <TableRow key={row.size}>
                                            <TableCell className="font-inter text-right font-medium">
                                                {row.size}
                                            </TableCell>
                                            {data.columns.map((col) => (
                                                <TableCell
                                                    key={col.key}
                                                    className="font-inter text-right"
                                                >
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
