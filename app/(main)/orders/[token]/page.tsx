"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { ArrowRight, MapPin, Package as PackageIcon, StickyNote, Truck } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { getOrderByToken } from "@/lib/api/order"
import type { Order } from "@/types/order"

import { OrderHeader } from "@/components/orders/order-header"
import { OrderItemsList } from "@/components/orders/order-items-list"
import { OrderAddressCard } from "@/components/orders/order-address-card"
import { OrderTotals } from "@/components/orders/order-totals"
import { OrderPaymentPanel } from "@/components/orders/order-payment-panel"
import { OrderListError } from "@/components/orders/order-list"

export default function OrderDetailPage() {
    const { token } = useParams<{ token: string }>()

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [paying, setPaying] = useState(false)

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

    function handlePay(gatewayId: number) {
        setPaying(true)
        // TODO(backend): call the "start payment" endpoint with
        // { token, gatewayId } and redirect the user to the returned
        // payment gateway URL. Left as a stub, same as the checkout page.
        setPaying(false)
        void gatewayId
    }

    const canPay = !!order && order.is_payable && !order.is_expired

    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div>
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight className="size-3.5" />
                        بازگشت به لیست سفارش‌ها
                    </Link>

                    <div className="mt-6">
                        {loading ? (
                            <div className="flex flex-col gap-8">
                                <Skeleton className="h-16 rounded-xl" />
                                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                                    <Skeleton className="h-72 rounded-xl" />
                                    <Skeleton className="h-56 rounded-xl" />
                                </div>
                            </div>
                        ) : error || !order ? (
                            <OrderListError message={error ?? "سفارش مورد نظر یافت نشد"} />
                        ) : (
                            <div className="flex flex-col gap-8">
                                <OrderHeader order={order} />

                                <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
                                    <div className="flex flex-col gap-8 lg:order-1">
                                        <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                            <div className="flex items-center gap-2">
                                                <PackageIcon className="size-4 text-muted-foreground" />
                                                <h2 className="text-base font-bold text-foreground">
                                                    اقلام سفارش
                                                </h2>
                                            </div>
                                            <div className="mt-5">
                                                <OrderItemsList items={order.items} />
                                            </div>
                                        </section>

                                        <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="size-4 text-muted-foreground" />
                                                <h2 className="text-base font-bold text-foreground">
                                                    آدرس تحویل
                                                </h2>
                                            </div>
                                            <div className="mt-5">
                                                <OrderAddressCard address={order.address} />
                                            </div>
                                        </section>

                                        {(order.tracking_code || order.shipping_company) && (
                                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="size-4 text-muted-foreground" />
                                                    <h2 className="text-base font-bold text-foreground">
                                                        اطلاعات ارسال
                                                    </h2>
                                                </div>
                                                <div className="mt-4 flex flex-col gap-2 text-sm">
                                                    {order.shipping_company && (
                                                        <div className="flex items-center justify-between text-muted-foreground">
                                                            <span>شرکت پستی</span>
                                                            <span className="text-foreground">
                                                                {order.shipping_company}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {order.tracking_code && (
                                                        <div className="flex items-center justify-between text-muted-foreground">
                                                            <span>کد رهگیری مرسوله</span>
                                                            <span
                                                                className="font-inter text-foreground"
                                                                dir="ltr"
                                                            >
                                                                {order.tracking_code}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {order.customer_note && (
                                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                                <div className="flex items-center gap-2">
                                                    <StickyNote className="size-4 text-muted-foreground" />
                                                    <h2 className="text-base font-bold text-foreground">
                                                        یادداشت شما
                                                    </h2>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                    {order.customer_note}
                                                </p>
                                            </section>
                                        )}

                                        {canPay && (
                                            <OrderPaymentPanel
                                                onSubmit={handlePay}
                                                submitting={paying}
                                            />
                                        )}
                                    </div>

                                    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:order-2">
                                        <div className="rounded-xl border border-border/60 p-5 sm:p-6">
                                            <h2 className="text-base font-bold text-foreground">
                                                خلاصه مالی
                                            </h2>
                                            <div className="mt-5">
                                                <OrderTotals order={order} />
                                            </div>

                                            {order.is_payable && order.is_expired && (
                                                <p className="mt-4 text-center text-xs text-destructive">
                                                    مهلت پرداخت این سفارش به پایان رسیده است
                                                </p>
                                            )}
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </PageContainer>
    )
}
