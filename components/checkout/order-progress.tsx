import {
    Ban,
    Check,
    ClipboardCheck,
    Clock,
    CreditCard,
    Loader2,
    RotateCcw,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Where an order currently stands in the checkout -> payment lifecycle.
 *  - "pending_payment": order created, waiting for the user to pay.
 *  - "processing":      payment was submitted and is being confirmed by
 *                        the gateway/bank.
 *  - "paid":             payment completed successfully.
 *  - "cancelled":        the order was cancelled before payment.
 *  - "expired":          the payment window closed before paying.
 *  - "refunded":         the order was paid and the amount was later
 *                        refunded.
 */
export type OrderStatus =
    "pending_payment" | "processing" | "paid" | "cancelled" | "expired" | "refunded"

type StepState =
    "done" | "active" | "processing" | "upcoming" | "cancelled" | "expired" | "refunded"

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

function resolveStepState(
    stepKey: StepDef["key"],
    status: OrderStatus,
    orderStepComplete: boolean
): StepState {
    // The "order" step's state is controlled by the caller: on pages where
    // the order already exists (e.g. the payment page), it's done. On the
    // checkout page itself, the order hasn't been registered yet, so it
    // should read as "active" instead. Only the payment step's visual state
    // depends on where the order currently stands.
    if (stepKey === "order") return orderStepComplete ? "done" : "active"

    switch (status) {
        case "pending_payment":
            return "active"
        case "processing":
            return "processing"
        case "paid":
            return "done"
        case "cancelled":
            return "cancelled"
        case "expired":
            return "expired"
        case "refunded":
            return "refunded"
    }
}

function stepDescription(step: StepDef, status: OrderStatus): string {
    if (step.key !== "payment") return step.description

    switch (status) {
        case "processing":
            return "در حال بررسی پرداخت"
        case "paid":
            return "پرداخت با موفقیت انجام شد"
        case "cancelled":
            return "سفارش لغو شده است"
        case "expired":
            return "مهلت پرداخت به پایان رسیده"
        case "refunded":
            return "مبلغ پرداختی بازگردانده شد"
        default:
            return step.description
    }
}

function stepIcon(step: StepDef, state: StepState): LucideIcon {
    if (state === "done") return Check
    if (step.key !== "payment") return step.icon

    switch (state) {
        case "processing":
            return Loader2
        case "cancelled":
            return Ban
        case "expired":
            return Clock
        case "refunded":
            return RotateCcw
        default:
            return step.icon
    }
}

interface OrderFlowProgressProps {
    status: OrderStatus
    /**
     * Whether the "order registration" step itself is complete. Defaults to
     * `true`, since this component is normally rendered once an order (and
     * therefore an `OrderStatus`) already exists - e.g. on the payment page.
     * Pass `false` on the checkout page itself, where the user is still
     * filling in order details and that first step should read as "active",
     * not "done".
     */
    orderStepComplete?: boolean
    className?: string
}

export function OrderFlowProgress({
    status,
    orderStepComplete = true,
    className,
}: OrderFlowProgressProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border/60 bg-muted/30 px-4 py-4 sm:px-6",
                className
            )}
        >
            <ol className="flex items-center">
                {STEPS.map((step, index) => {
                    const state = resolveStepState(step.key, status, orderStepComplete)
                    const isLast = index === STEPS.length - 1
                    const Icon = stepIcon(step, state)

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
                                        state === "processing" &&
                                            "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40",
                                        state === "upcoming" &&
                                            "border-border/60 bg-background text-muted-foreground/60",
                                        state === "cancelled" &&
                                            "border-destructive bg-destructive/10 text-destructive",
                                        state === "expired" &&
                                            "border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950/40",
                                        state === "refunded" &&
                                            "border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-950/40"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "size-5",
                                            state === "processing" && "animate-spin"
                                        )}
                                        strokeWidth={state === "done" ? 2.5 : 2}
                                    />
                                </span>

                                <div className="flex flex-col">
                                    <span
                                        className={cn(
                                            "text-sm font-bold",
                                            (state === "active" ||
                                                state === "done" ||
                                                state === "processing") &&
                                                "text-foreground",
                                            state === "upcoming" && "text-muted-foreground",
                                            state === "cancelled" && "text-destructive",
                                            state === "expired" && "text-amber-600",
                                            state === "refunded" && "text-violet-600"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    <span className="hidden text-xs text-muted-foreground sm:block">
                                        {stepDescription(step, status)}
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
