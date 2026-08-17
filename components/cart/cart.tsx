"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"

import CartSheet from "./cart-sheet"
import { useCart } from "@/hooks/use-cart"

export default function Cart() {
    const [open, setOpen] = useState(false)

    const { cart, itemCount, updateQuantity, removeItem } = useCart()

    const items = cart?.items ?? []

    const handleQuantityChange = async (sku: string, quantity: number) => {
        if (quantity < 1) return

        // available_stock reflects this item's total stock, independent of
        // how many are already sitting in the cart, so it's the correct
        // ceiling to clamp against here.
        const item = items.find((i) => i.sku === sku)
        if (item && quantity > item.available_stock) {
            quantity = item.available_stock
        }
        if (item && quantity === item.quantity) return

        await updateQuantity(sku, quantity)
    }

    const handleRemove = async (sku: string) => {
        await removeItem(sku)
    }

    return (
        <CartSheet
            items={items}
            open={open}
            onOpenChange={setOpen}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            trigger={
                <div className="icon relative size-9 items-center rounded-lg">
                    <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />

                    {itemCount > 0 && (
                        <Badge className="font-inter absolute top-0 right-0.5 h-3.5 w-3.5 justify-center rounded-full px-1 text-[10px] leading-none font-bold">
                            {itemCount}
                        </Badge>
                    )}
                </div>
            }
        />
    )
}
