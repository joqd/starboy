"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getOrderByToken } from "@/lib/api/order"
import type { Order } from "@/types/order"

import { PaymentResultStatus, type PaymentResultKind } from "@/components/orders/payment-result"
import { OrderTotals } from "@/components/orders/order-totals"
import { OrderListError } from "@/components/orders/order-list"

function OrderPaymentResultContent() {
    const { token } = useParams<{ token: string }>()
    const searchParams = useSearchParams()
    // The backend only ever sends "success" or "failed" here; anything else
    // is treated as a failed payment rather than left unhandled.
    const status: PaymentResultKind =
        searchParams.get("status") === "success" ? "success" : "failed"

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrder = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getOrderByToken(token)
            setOrder(res)
        } catch {
            setError("سفارش مورد نظر یافت نشد یا خطایی رخ داده است")
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrder()
    }, [fetchOrder])

    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div className="mx-auto max-w-lg">
                    {loading ? (
                        <div className="flex flex-col gap-6">
                            <Skeleton className="h-40 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                        </div>
                    ) : error || !order ? (
                        <OrderListError message={error ?? "سفارش مورد نظر یافت نشد"} />
                    ) : (
                        <div className="flex flex-col items-center gap-8">
                            <PaymentResultStatus kind={status} />

                            <div className="w-full rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">شماره سفارش</span>
                                    <span
                                        className="font-inter font-medium text-foreground"
                                        dir="ltr"
                                    >
                                        {order.order_number}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <OrderTotals order={order} />
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row-reverse">
                                <Link href={`/orders/${order.token}`} className="flex-1">
                                    <Button className="w-full">مشاهده جزئیات سفارش</Button>
                                </Link>
                                <Link href="/orders" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <ArrowRight className="size-4" />
                                        بازگشت به لیست سفارش‌ها
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </PageContainer>
    )
}

// useSearchParams requires a Suspense boundary in the app router.
export default function OrderPaymentResultPage() {
    return (
        <Suspense fallback={null}>
            <OrderPaymentResultContent />
        </Suspense>
    )
}
