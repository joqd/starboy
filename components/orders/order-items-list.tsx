import Image from "next/image"
import { Package } from "lucide-react"

import type { Order } from "@/types/order"

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

export function OrderItemsList({ items }: { items: Order["items"] }) {
    return (
        <ul className="flex flex-col gap-4">
            {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                    <div className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/80 dark:bg-accent">
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <Package className="size-5 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-sm font-medium text-foreground">
                            {item.title}
                        </span>
                        <span className="font-inter text-xs text-muted-foreground" dir="ltr">
                            {item.sku}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {item.quantity.toLocaleString("fa-IR")} × {formatToman(item.unit_price)}
                        </span>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-foreground">
                        {formatToman(item.total_price)}
                    </span>
                </li>
            ))}
        </ul>
    )
}
