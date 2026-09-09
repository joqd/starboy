import { ShoppingBag, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CartLineItem, formatToman } from "@/components/cart/cart-line-item"
import type { CartItem } from "@/types/cart"

export function OrderSummary({
    items,
    itemCount,
    subtotal,
    canSubmit,
    hasStockIssues,
    isPending,
    onIncrease,
    onDecrease,
    onRemove,
    onMatchAvailableStock,
}: {
    items: CartItem[]
    itemCount: number
    subtotal: number
    canSubmit: boolean
    hasStockIssues: boolean
    isPending: (sku: string) => boolean
    onIncrease: (item: CartItem) => void
    onDecrease: (item: CartItem) => void
    onRemove: (item: CartItem) => void
    onMatchAvailableStock: (item: CartItem) => void
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
                {items.map((item) => {
                    // Detected either from the initial/refetched cart, or
                    // patched in right after the order API reports someone
                    // else bought part of the stock out from under this cart.
                    const isOutOfStock = item.quantity > item.available_stock
                    const isSoldOut = item.available_stock <= 0

                    return (
                        <li key={item.sku}>
                            <div
                                className={
                                    isOutOfStock
                                        ? "rounded-lg opacity-60 transition-opacity"
                                        : "transition-opacity"
                                }
                            >
                                <CartLineItem
                                    item={item}
                                    pending={isPending(item.sku)}
                                    onIncrease={onIncrease}
                                    onDecrease={onDecrease}
                                    onRemove={onRemove}
                                />
                            </div>

                            {isOutOfStock && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-400">
                                    <TriangleAlert className="size-3.5 shrink-0" />
                                    <span className="grow">
                                        {isSoldOut
                                            ? "این کالا در همین لحظه ناموجود شد."
                                            : `فقط ${item.available_stock.toLocaleString("fa-IR")} عدد از این کالا موجود است.`}
                                    </span>
                                    {isSoldOut ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={isPending(item.sku)}
                                            onClick={() => onRemove(item)}
                                            className="h-6 px-2 text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400"
                                        >
                                            حذف از سبد
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={isPending(item.sku)}
                                            onClick={() => onMatchAvailableStock(item)}
                                            className="h-6 px-2 text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400"
                                        >
                                            {`کاهش به ${item.available_stock.toLocaleString("fa-IR")} عدد`}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </li>
                    )
                })}
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
                    {hasStockIssues
                        ? "برای ثبت سفارش، آیتم‌های مشخص‌شده در بالا را اصلاح کنید"
                        : "برای ثبت سفارش، آدرس تحویل را انتخاب کنید"}
                </p>
            )}

            <Button
                type="submit"
                form="checkout-form"
                disabled={!canSubmit}
                className="mt-6 flex w-full lg:hidden"
            >
                {hasStockIssues ? "ابتدا سبد خرید را اصلاح کنید" : "ثبت سفارش"}
            </Button>
        </div>
    )
}
