"use client"

import { useEffect, useState } from "react"
import { Wallet, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PaymentSection } from "@/components/checkout/payment-section"
import { getGateways } from "@/lib/api/gateway"
import { cancelOrderByToken } from "@/lib/api/order"
import type { Gateway } from "@/types/gateway"

export function OrderPaymentPanel({
    orderToken,
    onSubmit,
    onCancelled,
    submitting,
}: {
    orderToken: string
    onSubmit: (gatewayId: number) => void
    onCancelled?: () => void
    submitting: boolean
}) {
    const [gateways, setGateways] = useState<Gateway[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null)

    const [cancelOpen, setCancelOpen] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)

    async function loadGateways() {
        setLoading(true)
        setError(null)
        try {
            const list = await getGateways()
            setGateways(list)
            setSelectedGatewayId((prev) => prev ?? list[0]?.id ?? null)
        } catch {
            setError("امکان دریافت درگاه‌های پرداخت وجود نداشت")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        async function run() {
            setLoading(true)
            setError(null)
            try {
                const list = await getGateways()
                if (cancelled) return
                setGateways(list)
                setSelectedGatewayId((prev) => prev ?? list[0]?.id ?? null)
            } catch {
                if (!cancelled) setError("امکان دریافت درگاه‌های پرداخت وجود نداشت")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        run()
        return () => {
            cancelled = true
        }
    }, [])

    async function handleCancelOrder() {
        setCancelling(true)
        setCancelError(null)
        try {
            await cancelOrderByToken(orderToken)
            setCancelOpen(false)
            onCancelled?.()
        } catch {
            setCancelError("لغو سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.")
        } finally {
            setCancelling(false)
        }
    }

    return (
        <section className="rounded-xl border border-border/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-muted-foreground" />
                    <h2 className="text-base font-bold text-foreground">درگاه پرداخت</h2>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ghost text-destructive hover:text-destructive"
                    onClick={() => setCancelOpen(true)}
                    disabled={submitting}
                >
                    لغو سفارش
                </Button>
            </div>

            <div className="mt-5">
                <PaymentSection
                    gateways={gateways}
                    loading={loading}
                    error={null}
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

            {/* Gateway load error */}
            <AlertDialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="size-5 text-destructive" />
                            خطا در دریافت درگاه‌ها
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {error}. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>بستن</AlertDialogCancel>
                        <AlertDialogAction onClick={loadGateways}>تلاش مجدد</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel order confirmation */}
            <AlertDialog
                open={cancelOpen}
                onOpenChange={(open) => !cancelling && setCancelOpen(open)}
            >
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>لغو سفارش</AlertDialogTitle>
                        <AlertDialogDescription>
                            آیا از لغو این سفارش مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}
                    <AlertDialogFooter dir="ltr">
                        <AlertDialogCancel disabled={cancelling}>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleCancelOrder()
                            }}
                            disabled={cancelling}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {cancelling && <Spinner className="size-3.5" />}
                            بله، لغو کن
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
