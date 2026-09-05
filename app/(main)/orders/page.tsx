"use client"

import { useCallback, useEffect, useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { getOrders } from "@/lib/api/order"
import type { OrderListItem, OrderStatus } from "@/types/order"

import { StatusFilter } from "@/components/orders/status-filter"
import {
    EmptyOrders,
    OrderList,
    OrderListError,
    OrderListSkeleton,
} from "@/components/orders/order-list"
import { OrderPagination } from "@/components/orders/order-pagination"
import { LoginRequired } from "@/components/orders/login-required"

const PAGE_SIZE = 10

export default function OrdersPage() {
    const { user, checkingSession, openLogin } = useAuth()

    const [status, setStatus] = useState<OrderStatus | null>(null)
    const [page, setPage] = useState(1)

    const [orders, setOrders] = useState<OrderListItem[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Once we know for sure there's no active session, prompt the global
    // login dialog automatically so the user isn't left on an empty page.
    // If they dismiss it, the <LoginRequired> card below still lets them
    // reopen it manually.
    useEffect(() => {
        if (!checkingSession && !user) {
            openLogin()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkingSession, user])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getOrders(status, page, PAGE_SIZE)
            setOrders(res.results)
            setCount(res.count)
        } catch {
            setError("خطا در دریافت لیست سفارش‌ها")
        } finally {
            setLoading(false)
        }
    }, [status, page])

    useEffect(() => {
        if (!user) return
        // This also re-runs right after a successful login (once `user`
        // switches from null to a value), so no extra wiring is needed there.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders()
    }, [user, fetchOrders])

    function handleStatusChange(next: OrderStatus | null) {
        setStatus(next)
        setPage(1)
    }

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight className="size-3.5" />
                        بازگشت به فروشگاه
                    </Link>

                    <div className="mt-4 mb-8 max-w-xl sm:mb-10">
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            لیست سفارشات
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                            در این صفحه لیست همه سفارشات ثبت شده قرار گرفته.
                        </p>
                    </div>

                    {checkingSession ? (
                        <OrderListSkeleton />
                    ) : !user ? (
                        <LoginRequired />
                    ) : (
                        <div className="flex flex-col gap-6">
                            <StatusFilter value={status} onChange={handleStatusChange} />

                            {loading ? (
                                <OrderListSkeleton />
                            ) : error ? (
                                <OrderListError message={error} />
                            ) : orders.length === 0 ? (
                                <EmptyOrders filtered={status !== null} />
                            ) : (
                                <>
                                    <OrderList orders={orders} />
                                    <OrderPagination
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </PageContainer>
    )
}
