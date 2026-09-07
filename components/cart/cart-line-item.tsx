import { Link } from "next-view-transitions"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { CartItem } from "@/types/cart"

export function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

/**
 * One cart row — image, title, size, quantity stepper, and line price.
 * Shared by the cart sheet and the checkout order summary so the two don't
 * drift into slightly different markup. Image and title link to the
 * product page; the stepper and remove button stay interactive on top of
 * that (they're siblings of the links, not nested inside them).
 */
export function CartLineItem({
    item,
    pending = false,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    item: CartItem
    /** Shows a spinner in place of the quantity while an update is in flight. */
    pending?: boolean
    onIncrease: (item: CartItem) => void
    onDecrease: (item: CartItem) => void
    onRemove: (item: CartItem) => void
}) {
    const hasDiscount = !!item.compare_price && item.compare_price > item.price
    const canIncrease = !pending && item.quantity < item.available_stock
    const canDecrease = !pending && item.quantity > 1
    const productHref = `/p/${item.slug}`

    return (
        <div className="flex items-stretch gap-3">
            <div className="relative aspect-3/4 w-20 shrink-0 self-stretch overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                <Link href={productHref} className="absolute inset-0">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.product_title}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="size-5 text-muted-foreground" />
                        </div>
                    )}
                </Link>
            </div>

            {/* min-w-0 here (and on the title link below) is what lets the
                title actually truncate/clamp instead of stretching this
                column — and the whole row — past its container. */}
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <Link href={productHref} className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-xs leading-snug font-medium text-foreground">
                            {item.product_title}
                        </h4>
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item)}
                        disabled={pending}
                        aria-label="حذف محصول"
                        className="size-6 shrink-0 text-muted-foreground/70 hover:bg-transparent hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>

                {item.size && (
                    <div>
                        <Badge
                            variant="outline"
                            className="h-4 border-border/80 px-1.5 text-[10px] font-normal text-muted-foreground"
                        >
                            سایز: {item.size}
                        </Badge>
                    </div>
                )}

                <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-md border border-border bg-muted/20 p-0.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onIncrease(item)}
                            disabled={!canIncrease}
                            aria-label="افزایش تعداد"
                            className="size-5 rounded text-foreground hover:bg-background disabled:opacity-30"
                        >
                            <Plus className="size-3" />
                        </Button>

                        <span className="flex w-6 items-center justify-center text-center text-xs font-semibold text-foreground tabular-nums">
                            {pending ? (
                                <Spinner className="size-3.5" />
                            ) : (
                                item.quantity.toLocaleString("fa-IR")
                            )}
                        </span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDecrease(item)}
                            disabled={!canDecrease}
                            aria-label="کاهش تعداد"
                            className="size-5 rounded text-foreground hover:bg-background disabled:opacity-30"
                        >
                            <Minus className="size-3" />
                        </Button>
                    </div>

                    <div className="flex flex-col items-end">
                        {hasDiscount && (
                            <span className="text-[10px] text-muted-foreground/80 tabular-nums line-through">
                                {formatToman((item.compare_price as number) * item.quantity)}
                            </span>
                        )}
                        <span className="text-xs font-bold text-foreground tabular-nums">
                            {formatToman(item.price * item.quantity)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
