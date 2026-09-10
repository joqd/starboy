import Image from "next/image"
import { ChevronDown, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { partitionGateways, type Gateway } from "@/types/gateway"
import { InlineFieldError } from "@/components/checkout/checkout-states"

export function PaymentSection({
    gateways,
    loading,
    error,
    selectedGatewayId,
    onSelect,
    forceExpandOthersSignal,
}: {
    gateways: Gateway[]
    loading: boolean
    error: string | null
    selectedGatewayId: number | null
    onSelect: (id: number) => void
    /**
     * Bump this number whenever the parent wants to force the "other
     * gateways" section open (e.g. the selected gateway just errored and we
     * want to nudge the user toward an alternative). Any change to a truthy
     * value expands the section; it's one-directional and never re-collapses
     * it on its own.
     */
    forceExpandOthersSignal?: number
}) {
    const [showOtherGateways, setShowOtherGateways] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (forceExpandOthersSignal) setShowOtherGateways(true)
    }, [forceExpandOthersSignal])

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

    const { primary, installment, others } = partitionGateways(gateways)
    const mainGateways = [...(primary ? [primary] : []), ...(installment ? [installment] : [])]

    function renderGatewayOption(gateway: Gateway) {
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
                <RadioGroupItem value={String(gateway.id)} id={fieldId} className="sr-only" />

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
                    <span className="text-sm font-medium text-foreground">{gateway.title}</span>
                    <span className="text-xs text-muted-foreground">{gateway.description}</span>
                </div>
            </Label>
        )
    }

    return (
        <div className="space-y-3">
            <RadioGroup
                value={selectedGatewayId ? String(selectedGatewayId) : undefined}
                onValueChange={(value) => onSelect(Number(value))}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {mainGateways.map(renderGatewayOption)}
                </div>

                {/* Animate to/from an unknown height via grid-template-rows
                    (0fr -> 1fr). No JS height measuring, no jump/glitch,
                    works no matter how many "other" gateways there are. */}
                {others.length > 0 && (
                    <div
                        className={cn(
                            "grid transition-[grid-template-rows] duration-300 ease-in-out",
                            showOtherGateways ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                    >
                        <div className="overflow-hidden">
                            <div className="grid gap-3 pt-3 sm:grid-cols-2">
                                {others.map(renderGatewayOption)}
                            </div>
                        </div>
                    </div>
                )}
            </RadioGroup>

            {others.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowOtherGateways((value) => !value)}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span>
                        {showOtherGateways ? "مخفی کردن سایر درگاه‌ها" : "سایر درگاه‌های پرداخت"}
                    </span>

                    <ChevronDown
                        className={cn(
                            "size-3.5 transition-transform duration-300",
                            showOtherGateways && "rotate-180"
                        )}
                    />
                </button>
            )}
        </div>
    )
}
