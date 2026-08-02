"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"

import CartSheet from "./cart-sheet"
import { useCart } from "@/hooks/use-cart"

export default function Cart() {
    const [open, setOpen] = useState(false)

    const { cart, updateItem, removeItem } = useCart()

    const items = cart?.items ?? []

    const handleQuantityChange = async (sku: string, quantity: number) => {
        if (quantity < 1) return

        await updateItem(sku, quantity)
    }

    const handleRemove = async (sku: string) => {
        await removeItem(sku)
    }

    const handleCheckout = () => {
        console.log("checkout", cart)
    }

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartSheet
            items={items}
            open={open}
            onOpenChange={setOpen}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            onCheckout={handleCheckout}
            trigger={
                <div className="ghost relative">
                    <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />

                    {itemCount > 0 && (
                        <Badge
                            variant="ghost"
                            className="ghost absolute -top-3 -right-3 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] leading-none font-bold"
                        >
                            {itemCount}
                        </Badge>
                    )}
                </div>
            }
        />
    )
}
