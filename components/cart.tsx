"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"
import CartSheet, { type CartItem } from "./cart-sheet"

export default function Cart() {
    const [open, setOpen] = useState(false)

    const [items, setItems] = useState<CartItem[]>([
        {
            id: 1,
            title: "هودی استاربوی مدل کلاسیک",
            image: "/products/hoodie-1.jpg",
            size_name: "L",
            price: 1250000,
            compare_price: 1500000,
            quantity: 1,
            stock: 5,
        },
        {
            id: 2,
            title: "تیشرت بیسیک سفید",
            image: "/products/tshirt-1.jpg",
            size_name: "M",
            price: 480000,
            compare_price: null,
            quantity: 2,
            stock: 3,
        },
    ])

    const handleQuantityChange = (id: number, quantity: number) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }

    const handleRemove = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const handleCheckout = () => {
        console.log("در حال انتقال به صفحه‌ی تسویه‌حساب با آیتم‌های:", items)
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
