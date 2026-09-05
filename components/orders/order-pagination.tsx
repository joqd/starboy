import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages = new Set<number>([1, total, current - 1, current, current + 1])
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

    const result: (number | "ellipsis")[] = []
    let prev = 0
    for (const p of sorted) {
        if (prev && p - prev > 1) result.push("ellipsis")
        result.push(p)
        prev = p
    }
    return result
}

export function OrderPagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}) {
    if (totalPages <= 1) return null

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className={cn(
                            "flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                            page === 1 && "pointer-events-none opacity-40"
                        )}
                    >
                        {/* In this RTL layout "previous" moves toward the right,
                            matching the ArrowRight used for "back" elsewhere. */}
                        <ChevronRight className="size-4" />
                        قبلی
                    </button>
                </PaginationItem>

                {getPageNumbers(page, totalPages).map((entry, index) =>
                    entry === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={entry}>
                            <PaginationLink
                                href="#"
                                isActive={entry === page}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(entry)
                                }}
                            >
                                {entry.toLocaleString("fa-IR")}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className={cn(
                            "flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                            page === totalPages && "pointer-events-none opacity-40"
                        )}
                    >
                        بعدی
                        <ChevronLeft className="size-4" />
                    </button>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
