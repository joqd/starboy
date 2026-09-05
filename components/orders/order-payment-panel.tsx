"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { PaymentSection } from "@/components/checkout/payment-section"
import { getGateways } from "@/lib/api/gateway"
import type { Gateway } from "@/types/gateway"

export function OrderPaymentPanel({
    onSubmit,
    submitting,
}: {
    onSubmit: (gatewayId: number) => void
    submitting: boolean
}) {
    const [gateways, setGateways] = useState<Gateway[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null)

    useEffect(() => {
        let cancelled = false

        async function loadGateways() {
            setLoading(true)
            setError(null)
            try {
                const list = await getGateways()
                if (cancelled) return
                setGateways(list)
                setSelectedGatewayId((prev) => prev ?? list[0]?.id ?? null)
            } catch {
                if (!cancelled) setError("خطا در دریافت درگاه‌های پرداخت")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadGateways()
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <section className="rounded-xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-2">
                <Wallet className="size-4 text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">درگاه پرداخت</h2>
            </div>

            <div className="mt-5">
                <PaymentSection
                    gateways={gateways}
                    loading={loading}
                    error={error}
                    selectedGatewayId={selectedGatewayId}
                    onSelect={setSelectedGatewayId}
                />
            </div>

            <Button
                type="button"
                disabled={!selectedGatewayId || submitting}
                onClick={() => selectedGatewayId && onSubmit(selectedGatewayId)}
                className="text-md mt-6 h-11 w-full"
            >
                {submitting && <Spinner className="size-3.5" />}
                پرداخت سفارش
            </Button>
        </section>
    )
}
