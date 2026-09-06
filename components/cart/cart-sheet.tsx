"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, X } from "lucide-react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { CartLineItem } from "@/components/cart/cart-line-item"

import type { CartItem } from "@/types/cart"
import { ScrollArea } from "../ui/scroll-area"

type Props = {
    items: CartItem[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onQuantityChange: (sku: string, quantity: number) => void
    onRemove: (sku: string) => void
    trigger?: ReactNode
}

export default function CartSheet({
    items,
    open,
    onOpenChange,
    onQuantityChange,
    onRemove,
    trigger,
}: Props) {
    const router = useRouter()
    const { user, checkingSession, openLogin } = useAuth()

    const isEmpty = items.length === 0
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const compareTotal = items.reduce(
        (sum, item) => sum + (item.compare_price ?? item.price) * item.quantity,
        0
    )
    const totalSaved = compareTotal - subtotal

    const goToCheckout = () => {
        onOpenChange(false)
        router.push("/checkout")
    }

    const handleCheckout = () => {
        // Not signed in: close the cart, send them to login, and resume
        // checkout automatically the moment they finish logging in.
        if (!user) {
            onOpenChange(false)
            openLogin(goToCheckout)
            return
        }

        goToCheckout()
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger>{trigger}</SheetTrigger>}
            <SheetContent
                side="right"
                dir="ltr"
                showCloseButton={false}
                className="z-9999 flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md"
            >
                <SheetHeader
                    dir="rtl"
                    className="flex-none space-y-0 border-b border-border px-5 py-4"
                >
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 text-base font-bold text-primary">
                            <ShoppingBag className="h-4.5 w-4.5" />
                            سبد خرید
                        </SheetTitle>
                        <SheetClose
                            aria-label="بستن سبد خرید"
                            className="flex h-8 w-8 items-center justify-center transition active:scale-90"
                        >
                            <X className="h-4 w-4" />
                        </SheetClose>
                    </div>
                </SheetHeader>

                {isEmpty ? (
                    <div
                        dir="rtl"
                        className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <ShoppingBag
                                className="h-7 w-7 text-muted-foreground"
                                strokeWidth={1.5}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                سبد خرید شما خالی است
                            </p>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                                محصولی که می‌پسندید را به سبد خرید اضافه کنید
                            </p>
                        </div>
                        <Button onClick={() => onOpenChange(false)}>مشاهده محصولات</Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="min-h-0 flex-1 px-4">
                            <div dir="rtl" className="flex flex-col divide-y divide-border/60 py-2">
                                {items.map((item) => (
                                    <div key={item.sku} className="py-3.5 first:pt-1 last:pb-1">
                                        <CartLineItem
                                            item={item}
                                            onIncrease={(it) =>
                                                onQuantityChange(
                                                    it.sku,
                                                    Math.min(it.available_stock, it.quantity + 1)
                                                )
                                            }
                                            onDecrease={(it) =>
                                                onQuantityChange(
                                                    it.sku,
                                                    Math.max(1, it.quantity - 1)
                                                )
                                            }
                                            onRemove={(it) => onRemove(it.sku)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div
                            dir="rtl"
                            className="flex-none space-y-3 border-t border-border bg-muted/30 px-5 py-4"
                        >
                            {totalSaved > 0 && (
                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-muted-foreground">
                                        سود شما از این خرید
                                    </span>
                                    <span className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                        {formatPrice(totalSaved)} تومان
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-muted-foreground">
                                    جمع کل
                                </span>
                                <span className="text-lg font-bold text-foreground tabular-nums">
                                    {formatPrice(subtotal)} تومان
                                </span>
                            </div>

                            <Button
                                className={"h-11 w-full text-lg"}
                                onClick={handleCheckout}
                                disabled={checkingSession}
                            >
                                ثبت سفارش
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
