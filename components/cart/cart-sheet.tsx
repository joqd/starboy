"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
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

import type { CartItem } from "@/types/cart"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"

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
                                {items.map((item) => {
                                    const hasDiscount =
                                        !!item.compare_price && item.compare_price > item.price

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-stretch gap-3 py-3.5 first:pt-1 last:pb-1"
                                        >
                                            <div className="relative aspect-3/4 w-20 shrink-0 self-stretch overflow-hidden rounded-lg border border-border bg-muted/40">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.product_title}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between gap-1.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="line-clamp-2 text-xs leading-snug font-medium text-foreground">
                                                        {item.product_title}
                                                    </h4>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onRemove(item.sku)}
                                                        aria-label="حذف محصول"
                                                        className="h-6 w-6 shrink-0 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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

                                                <div className="mt-1 flex items-center justify-between">
                                                    <div className="flex items-center rounded-md border border-border bg-muted/20 p-0.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                onQuantityChange(
                                                                    item.sku,
                                                                    Math.min(
                                                                        item.available_stock,
                                                                        item.quantity + 1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity >=
                                                                item.available_stock
                                                            }
                                                            aria-label="افزایش تعداد"
                                                            className="h-5 w-5 rounded text-foreground hover:bg-background"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>

                                                        <span className="w-6 text-center text-xs font-semibold text-foreground tabular-nums">
                                                            {formatPrice(item.quantity)}
                                                        </span>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                onQuantityChange(
                                                                    item.sku,
                                                                    Math.max(1, item.quantity - 1)
                                                                )
                                                            }
                                                            disabled={item.quantity <= 1}
                                                            aria-label="کاهش تعداد"
                                                            className="h-5 w-5 rounded text-foreground hover:bg-background disabled:opacity-30"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        {hasDiscount && (
                                                            <span className="text-[10px] text-muted-foreground/80 tabular-nums line-through">
                                                                {formatPrice(
                                                                    (item.compare_price as number) *
                                                                        item.quantity
                                                                )}
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-bold text-foreground tabular-nums">
                                                            {formatPrice(
                                                                item.price * item.quantity
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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
                                className={"w-full"}
                                onClick={handleCheckout}
                                disabled={checkingSession}
                            >
                                تسویه حساب
                            </Button>

                            <Button
                                variant="secondary"
                                className={"w-full"}
                                onClick={() => onOpenChange(false)}
                            >
                                ادامه‌ی خرید
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
