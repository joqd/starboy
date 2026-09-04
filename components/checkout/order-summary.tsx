import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { CartItem } from "@/types/cart"

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

export function OrderSummary({
    items,
    itemCount,
    subtotal,
    canSubmit,
    isPending,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    items: CartItem[]
    itemCount: number
    subtotal: number
    canSubmit: boolean
    isPending: (sku: string) => boolean
    onIncrease: (item: CartItem) => void
    onDecrease: (item: CartItem) => void
    onRemove: (item: CartItem) => void
}) {
    return (
        <div className="rounded-xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">
                    خلاصه سفارش
                    <span className="mr-1 text-xs font-normal text-muted-foreground">
                        ({itemCount.toLocaleString("fa-IR")} کالا)
                    </span>
                </h2>
            </div>

            <ul className="mt-5 flex flex-col gap-4">
                {items.map((item) => (
                    <CartLine
                        key={item.sku}
                        item={item}
                        pending={isPending(item.sku)}
                        onIncrease={() => onIncrease(item)}
                        onDecrease={() => onDecrease(item)}
                        onRemove={() => onRemove(item)}
                    />
                ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-5 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>جمع جزء</span>
                    <span className="text-foreground">{formatToman(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>هزینه ارسال</span>
                    <span className="text-xs">پس از ثبت سفارش محاسبه می‌شود</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 text-base font-bold text-foreground">
                    <span>مبلغ قابل پرداخت</span>
                    <span>{formatToman(subtotal)}</span>
                </div>
            </div>

            {!canSubmit && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                    برای ثبت سفارش، آدرس تحویل و درگاه پرداخت را انتخاب کنید
                </p>
            )}

            <Button
                type="submit"
                form="checkout-form"
                disabled={!canSubmit}
                className="mt-6 flex w-full lg:hidden"
            >
                ثبت سفارش و پرداخت
            </Button>
        </div>
    )
}

function CartLine({
    item,
    pending,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    item: CartItem
    pending: boolean
    onIncrease: () => void
    onDecrease: () => void
    onRemove: () => void
}) {
    const canIncrease = !pending && item.quantity < item.available_stock
    const canDecrease = !pending && item.quantity > 1

    return (
        <li className="flex items-center gap-3">
            <div className="relative flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/80 dark:bg-accent">
                {item.image ? (
                    <Link href={`/p/${item.slug}`}>
                        <Image
                            src={item.image}
                            alt={item.product_title}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    </Link>
                ) : (
                    <ShoppingBag className="size-5 text-muted-foreground" />
                )}
            </div>

            <div className="flex h-24 min-w-0 flex-1 flex-col justify-between gap-1.5">
                <Link href={`/p/${item.slug}`}>
                    <span className="truncate text-sm font-medium text-foreground">
                        {item.product_title}
                    </span>
                </Link>
                <span className="text-xs text-muted-foreground">{item.size}</span>

                <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border/60">
                        <button
                            type="button"
                            onClick={onDecrease}
                            disabled={!canDecrease}
                            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            aria-label="کاهش تعداد"
                        >
                            <Minus className="size-3.5" />
                        </button>
                        <span className="flex w-5 items-center justify-center text-center text-xs font-medium text-foreground">
                            {pending ? (
                                <Spinner className="size-3.5" />
                            ) : (
                                item.quantity.toLocaleString("fa-IR")
                            )}
                        </span>
                        <button
                            type="button"
                            onClick={onIncrease}
                            disabled={!canIncrease}
                            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            aria-label="افزایش تعداد"
                        >
                            <Plus className="size-3.5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={pending}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                    >
                        <Trash2 className="size-3.5" />
                        حذف
                    </button>
                </div>
            </div>

            <span className="shrink-0 text-sm font-bold text-foreground">
                {formatToman(item.price * item.quantity)}
            </span>
        </li>
    )
}
