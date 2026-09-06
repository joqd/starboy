import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CartLineItem, formatToman } from "@/components/cart/cart-line-item"
import type { CartItem } from "@/types/cart"

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
                    <li key={item.sku}>
                        <CartLineItem
                            item={item}
                            pending={isPending(item.sku)}
                            onIncrease={onIncrease}
                            onDecrease={onDecrease}
                            onRemove={onRemove}
                        />
                    </li>
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
