import Image from "next/image"
import { CreditCard } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import type { Gateway } from "@/types/gateway"
import { InlineFieldError } from "@/components/checkout/checkout-states"

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

    return (
        <RadioGroup
            value={selectedGatewayId ? String(selectedGatewayId) : undefined}
            onValueChange={(value) => onSelect(Number(value))}
            className="grid gap-3 sm:grid-cols-2"
        >
            {gateways.map((gateway, index) => {
                const fieldId = `gateway-${gateway.id}`
                const selected = selectedGatewayId === gateway.id
                // When the list has an odd number of gateways, the last
                // card would otherwise sit alone on its row with an empty
                // slot beside it. Stretching it across both columns fills
                // the row instead of leaving a gap.
                const isDanglingLast = index === gateways.length - 1 && gateways.length % 2 !== 0
                return (
                    <Label
                        key={gateway.id}
                        htmlFor={fieldId}
                        className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-xl border p-4 font-normal transition-colors",
                            selected
                                ? "border-foreground/70 bg-white/80 dark:bg-accent"
                                : "border-border/60 hover:border-foreground/30",
                            isDanglingLast && "sm:col-span-2"
                        )}
                    >
                        <RadioGroupItem
                            value={String(gateway.id)}
                            id={fieldId}
                            className="sr-only"
                        />

                        {gateway.badge ? (
                            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
                                <Image
                                    src={gateway.badge}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="h-12 w-12 object-contain"
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
    )
}
