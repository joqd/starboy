import Link from "next/link"
import { PackageOpen, XCircle } from "lucide-react"
import { Button } from "../ui/button"

import { Skeleton } from "@/components/ui/skeleton"

export function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/80 dark:bg-accent">
                <PackageOpen className="size-10 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">سبد خرید شما خالی است</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    برای ادامه، ابتدا چند محصول به سبد خرید خود اضافه کنید.
                </p>
            </div>
            <Link href="/">
                <Button>مشاهده محصولات</Button>
            </Link>
        </div>
    )
}

export function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 px-6 py-20 text-center">
            <XCircle className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
    )
}

export function CheckoutSkeleton() {
    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-8">
                <Skeleton className="h-56 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
        </div>
    )
}

export function InlineFieldError({ message }: { message: string }) {
    return (
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <XCircle className="size-3.5" />
            {message}
        </p>
    )
}
