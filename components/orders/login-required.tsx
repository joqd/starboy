"use client"

import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function LoginRequired() {
    const { openLogin } = useAuth()

    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/80 dark:bg-accent">
                <LogIn className="size-6 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">
                    برای مشاهده سفارش‌ها وارد شوید
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    برای دسترسی به تاریخچه سفارش‌های خود، ابتدا وارد حساب کاربری‌تان شوید.
                </p>
            </div>
            <Button onClick={() => openLogin()} className="mt-2">
                ورود به حساب کاربری
            </Button>
        </div>
    )
}
