import { Check, ClipboardCheck, CreditCard, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Where the user is in the checkout -> order -> payment journey.
 *  - "order":   filling in address/notes on the checkout page, order not
 *               created yet.
 *  - "payment": order created, sitting on the order page waiting to pay.
 *  - "paid":    order created and payment already completed.
 *  - "expired": order created but the payment window closed before paying.
 */
export type OrderFlowStatus = "order" | "payment" | "paid" | "expired"

type StepState = "done" | "active" | "upcoming" | "error"

interface StepDef {
    key: "order" | "payment"
    label: string
    description: string
    icon: LucideIcon
}

const STEPS: StepDef[] = [
    {
        key: "order",
        label: "ثبت سفارش",
        description: "آدرس و اطلاعات تحویل",
        icon: ClipboardCheck,
    },
    {
        key: "payment",
        label: "پرداخت",
        description: "انتخاب درگاه و تسویه‌حساب",
        icon: CreditCard,
    },
]

function resolveStepState(stepKey: StepDef["key"], status: OrderFlowStatus): StepState {
    if (stepKey === "order") {
        return status === "order" ? "active" : "done"
    }
    switch (status) {
        case "order":
            return "upcoming"
        case "payment":
            return "active"
        case "paid":
            return "done"
        case "expired":
            return "error"
    }
}

interface OrderFlowProgressProps {
    status: OrderFlowStatus
    className?: string
}

export function OrderFlowProgress({ status, className }: OrderFlowProgressProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border/60 bg-muted/30 px-4 py-4 sm:px-6",
                className
            )}
        >
            <ol className="flex items-center">
                {STEPS.map((step, index) => {
                    const state = resolveStepState(step.key, status)
                    const isLast = index === STEPS.length - 1
                    const Icon = step.icon

                    return (
                        <li key={step.key} className="flex flex-1 items-center last:flex-none">
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                        state === "done" &&
                                            "border-foreground bg-foreground text-background",
                                        state === "active" &&
                                            "border-foreground bg-background text-foreground ring-[3px] ring-foreground/10",
                                        state === "upcoming" &&
                                            "border-border/60 bg-background text-muted-foreground/60",
                                        state === "error" &&
                                            "border-destructive bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {state === "done" ? (
                                        <Check className="size-5" strokeWidth={2.5} />
                                    ) : (
                                        <Icon className="size-5" strokeWidth={2} />
                                    )}
                                </span>

                                <div className="flex flex-col">
                                    <span
                                        className={cn(
                                            "text-sm font-bold",
                                            (state === "active" || state === "done") &&
                                                "text-foreground",
                                            state === "upcoming" && "text-muted-foreground",
                                            state === "error" && "text-destructive"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    <span className="hidden text-xs text-muted-foreground sm:block">
                                        {state === "error" && step.key === "payment"
                                            ? "مهلت پرداخت به پایان رسیده"
                                            : step.description}
                                    </span>
                                </div>
                            </div>

                            {!isLast && (
                                <span
                                    className={cn(
                                        "mx-3 h-0.5 flex-1 rounded-full transition-colors sm:mx-5",
                                        state === "done" ? "bg-foreground" : "bg-border/60"
                                    )}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
