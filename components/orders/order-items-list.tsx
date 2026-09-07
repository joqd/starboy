import Image from "next/image"
import { Package } from "lucide-react"

import type { Order } from "@/types/order"

function formatNumber(value: number) {
    return `${value.toLocaleString("fa-IR")}`
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

                    <div className="flex w-full flex-col justify-between">
                        <div className="flex w-full justify-between">
                            <div>{item.title}</div>
                            <div className="flex shrink-0 gap-3 text-sm font-bold text-foreground">
                                <div>
                                    {item.quantity > 1 && (
                                        <div className="opacity-40">
                                            {formatNumber(item.unit_price)} ×{" "}
                                            {formatNumber(item.quantity)}
                                        </div>
                                    )}
                                </div>
                                <div>{formatNumber(item.total_price)}</div>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}
