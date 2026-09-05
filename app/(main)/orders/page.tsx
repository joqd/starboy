"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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

    // Whether we've already picked the initial filter for this session
    // (see the effect below). Guards the normal fetch effect so it doesn't
    // re-fetch data the init step already loaded.
    const [initialized, setInitialized] = useState(false)
    const lastFetchedKey = useRef<string | null>(null)

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

    // Reset local state on logout so a subsequent login re-runs the
    // initial-filter logic below instead of reusing a stale result.
    useEffect(() => {
        if (user) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInitialized(false)
        setOrders([])
        setCount(0)
        setStatus(null)
        setPage(1)
        lastFetchedKey.current = null
    }, [user])

    // Decide the starting filter: if the user has any order still awaiting
    // payment, open the list on that filter so it's front and center;
    // otherwise show everything. Runs once per login.
    useEffect(() => {
        if (!user || initialized) return

        let cancelled = false

        async function determineInitialFilter() {
            setLoading(true)
            setError(null)
            try {
                const pendingRes = await getOrders("pending_payment", 1, PAGE_SIZE)
                if (cancelled) return

                if (pendingRes.count > 0) {
                    lastFetchedKey.current = "pending_payment-1"
                    setStatus("pending_payment")
                    setOrders(pendingRes.results)
                    setCount(pendingRes.count)
                } else {
                    const allRes = await getOrders(null, 1, PAGE_SIZE)
                    if (cancelled) return
                    lastFetchedKey.current = "null-1"
                    setOrders(allRes.results)
                    setCount(allRes.count)
                }
            } catch {
                if (!cancelled) setError("خطا در دریافت لیست سفارش‌ها")
            } finally {
                if (!cancelled) {
                    setLoading(false)
                    setInitialized(true)
                }
            }
        }

        determineInitialFilter()
        return () => {
            cancelled = true
        }
    }, [user, initialized])

    const fetchOrders = useCallback(async (s: OrderStatus | null, p: number) => {
        setLoading(true)
        setError(null)
        try {
            const res = await getOrders(s, p, PAGE_SIZE)
            setOrders(res.results)
            setCount(res.count)
        } catch {
            setError("خطا در دریافت لیست سفارش‌ها")
        } finally {
            setLoading(false)
        }
    }, [])

    // Handles every filter/page change made *after* the initial load above.
    useEffect(() => {
        if (!user || !initialized) return
        const key = `${status ?? "null"}-${page}`
        if (lastFetchedKey.current === key) return
        lastFetchedKey.current = key
        fetchOrders(status, page)
    }, [user, initialized, status, page, fetchOrders])

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
