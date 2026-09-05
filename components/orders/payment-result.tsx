import type { LucideIcon } from "lucide-react"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type PaymentResultKind = "success" | "failed" | "error"

const resultMap: Record<
    PaymentResultKind,
    { icon: LucideIcon; iconClassName: string; title: string; description: string }
> = {
    success: {
        icon: CheckCircle2,
        iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        title: "پرداخت با موفقیت انجام شد",
        description: "سفارش شما ثبت شد و به‌زودی پردازش می‌شود.",
    },
    failed: {
        icon: XCircle,
        iconClassName: "bg-destructive/10 text-destructive",
        title: "پرداخت انجام نشد",
        description: "پرداخت شما توسط درگاه تأیید نشد. می‌توانید دوباره تلاش کنید.",
    },
    error: {
        icon: AlertTriangle,
        iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        title: "مشکلی در ایجاد پرداخت پیش آمد",
        description: "امکان اتصال به درگاه پرداخت وجود نداشت. لطفاً دوباره تلاش کنید.",
    },
}

/** Shared icon + title + description block used on the payment result pages. */
export function PaymentResultStatus({ kind }: { kind: PaymentResultKind }) {
    const meta = resultMap[kind]
    const Icon = meta.icon

    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div
                className={cn(
                    "flex size-16 items-center justify-center rounded-full",
                    meta.iconClassName
                )}
            >
                <Icon className="size-8" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{meta.title}</h1>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground sm:text-base">
                    {meta.description}
                </p>
            </div>
        </div>
    )
}
