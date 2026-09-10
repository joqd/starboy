import Image from "next/image"
import { ChevronDown, CreditCard } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import type { Gateway } from "@/types/gateway"
import { InlineFieldError } from "@/components/checkout/checkout-states"
import { useState } from "react"

export function PaymentSection({
    gateways,
    loading,
    error,
    selectedGatewayId,
    onSelect,
}: {
    gateways: Gateway[]
    loading: boolean
    error: string | null
    selectedGatewayId: number | null
    onSelect: (id: number) => void
}) {
    const [showOtherGateways, setShowOtherGateways] = useState(false)

    if (loading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="col-span-full">
                    <InlineFieldError message={error} />
                </div>
            </div>
        )
    }

    if (gateways.length === 0) {
        return <p className="text-xs text-muted-foreground">در حال حاضر درگاه پرداختی موجود نیست</p>
    }

    const paymentGateways = gateways.filter((gateway) => !gateway.is_installment)
    const installmentGateway = gateways.find((gateway) => gateway.is_installment)

    const primaryGateway = paymentGateways[0]
    const otherGateways = paymentGateways.slice(1)

    const visibleGateways = [
        ...(primaryGateway ? [primaryGateway] : []),
        ...(installmentGateway ? [installmentGateway] : []),
        ...(showOtherGateways ? otherGateways : []),
    ]

    return (
        <div className="space-y-3">
            <RadioGroup
                value={selectedGatewayId ? String(selectedGatewayId) : undefined}
                onValueChange={(value) => onSelect(Number(value))}
                className="grid gap-3 sm:grid-cols-2"
            >
                {visibleGateways.map((gateway) => {
                    const fieldId = `gateway-${gateway.id}`
                    const selected = selectedGatewayId === gateway.id

                    return (
                        <Label
                            key={gateway.id}
                            htmlFor={fieldId}
                            className={cn(
                                "flex cursor-pointer items-center gap-4 rounded-xl border p-3 font-normal transition-colors",
                                selected
                                    ? "border-foreground/70 bg-white/80 dark:bg-accent"
                                    : "border-border/60 hover:border-foreground/30"
                            )}
                        >
                            <RadioGroupItem
                                value={String(gateway.id)}
                                id={fieldId}
                                className="sr-only"
                            />

                            {gateway.badge ? (
                                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
                                    <Image
                                        src={gateway.badge}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="size-full object-contain"
                                        unoptimized={gateway.badge.endsWith(".svg")}
                                    />
                                </span>
                            ) : (
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-background">
                                    <CreditCard className="size-7 text-foreground" />
                                </div>
                            )}

                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-foreground">
                                    {gateway.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {gateway.description}
                                </span>
                            </div>
                        </Label>
                    )
                })}
            </RadioGroup>

            {otherGateways.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowOtherGateways((value) => !value)}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span>
                        {showOtherGateways ? "مخفی کردن سایر درگاه‌ها" : `سایر درگاه‌های پرداخت`}
                    </span>

                    <ChevronDown
                        className={cn(
                            "size-3.5 transition-transform",
                            showOtherGateways && "rotate-180"
                        )}
                    />
                </button>
            )}
        </div>
    )
}
