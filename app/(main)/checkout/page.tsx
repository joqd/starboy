"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { useTransitionRouter } from "next-view-transitions"
import { PageContainer } from "@/components/layout/page-container"
import { Link } from "next-view-transitions"
import { ArrowRight, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import type { CartItem } from "@/types/cart"
import type { AddressListItem } from "@/types/address"
import { deleteAddress, getAddressList } from "@/lib/api/address"
import { createOrder } from "@/lib/api/checkout"

import { useToasts, ToastStack } from "@/components/checkout/toast-stack"
import { AddressSection } from "@/components/checkout/address-section"
import { AddressFormDialog } from "@/components/checkout/address-form-dialog"
import { OrderSummary } from "@/components/checkout/order-summary"
import { CheckoutSkeleton, EmptyCart, ErrorState } from "@/components/checkout/checkout-states"

// How often we quietly re-check the cart while the user is sitting on this
// page, so a stock change made by someone else shows up before they hit
// submit instead of only after. This is polling, not push/websocket
// real-time - see the note on handleSubmitOrder below for why.
const STOCK_POLL_INTERVAL_MS = 20_000

/**
 * The order API is expected to reject order creation with a structured
 * "insufficient stock" error when a race with another buyer is detected,
 * something like:
 *   { code: "insufficient_stock", items: [{ sku, available_stock }] }
 * This helper tries a couple of likely shapes so the UI degrades gracefully
 * even if the exact envelope differs - but it should be tightened up once
 * lib/api/checkout.ts's real error shape is confirmed.
 */
function extractStockConflict(err: unknown): { sku: string; available_stock: number }[] | null {
    const candidates = [
        (err as { items?: unknown }).items,
        (err as { data?: { items?: unknown } })?.data?.items,
        (err as { response?: { data?: { items?: unknown } } })?.response?.data?.items,
    ]
    for (const c of candidates) {
        if (Array.isArray(c) && c.every((i) => typeof i?.sku === "string")) {
            return c
        }
    }
    return null
}

export default function CheckoutPage() {
    const router = useTransitionRouter()
    const { user, checkingSession, openLogin, isLoginOpen } = useAuth()

    // Checkout requires a signed-in user. If someone lands here directly
    // (typed URL, bookmark, refresh) without a session, pop the login
    // dialog; if they dismiss it without logging in, send them back to the
    // storefront instead of leaving the checkout page half-visible.
    const hasOpenedLoginRef = useRef(false)

    useEffect(() => {
        if (checkingSession || user) return

        if (!hasOpenedLoginRef.current) {
            hasOpenedLoginRef.current = true
            openLogin()
            return
        }

        if (!isLoginOpen) {
            router.replace("/")
        }
    }, [checkingSession, user, isLoginOpen, openLogin, router])

    const isAuthorized = !checkingSession && !!user

    const {
        cart,
        isLoading,
        error,
        itemCount,
        updateQuantity,
        removeItem,
        isPending,
        refetch,
        applyStockUpdates,
        hasStockIssues,
    } = useCart()
    const { toasts, pushToast, dismissToast } = useToasts()

    // --- Addresses -----------------------------------------------------
    const [addresses, setAddresses] = useState<AddressListItem[]>([])
    const [addressesLoading, setAddressesLoading] = useState(true)
    const [addressesError, setAddressesError] = useState<string | null>(null)
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
    const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null)

    const [addressModalOpen, setAddressModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<AddressListItem | null>(null)

    // --- Order notes ------------------------------------------------------
    const [customerNote, setCustomerNote] = useState("")

    // --- Order submission ------------------------------------------------------
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
    // Order creation and payment are two separate steps now (see
    // handleSubmitOrder): if createOrder succeeds we always navigate away to
    // /orders/{token}, so cart-emptying and payment-link creation can never
    // land the user on a blank checkout page again. This dialog only ever
    // reports a createOrder failure that ISN'T a stock conflict (those get
    // their own inline treatment, see stockConflictNotice below), where the
    // cart is still intact.
    const [orderErrorOpen, setOrderErrorOpen] = useState(false)
    const [orderErrorMessage, setOrderErrorMessage] = useState("")
    // Set right after a stock conflict is detected, so we can show a
    // specific "here's exactly what changed" banner instead of the generic
    // failure dialog. Cleared as soon as the user fixes every flagged item.
    const [stockConflictNotice, setStockConflictNotice] = useState(false)

    const fetchAddresses = useCallback(async (preferId?: number) => {
        setAddressesLoading(true)
        setAddressesError(null)
        try {
            const list = await getAddressList()
            setAddresses(list.results)
            setSelectedAddressId((prev) => {
                const candidate = preferId ?? prev
                if (candidate && list.results.some((a) => a.id === candidate)) return candidate
                return list.results.find((a) => a.is_default)?.id ?? list.results[0]?.id ?? null
            })
        } catch {
            setAddressesError("خطا در دریافت آدرس‌ها")
        } finally {
            setAddressesLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAddresses()
    }, [fetchAddresses])

    // Quietly poll the cart while the user is on this page (and the tab is
    // actually visible) so a stock change elsewhere in the store has a good
    // chance of showing up before they submit, not just after a failed
    // submit. This is a pragmatic middle ground, not true real-time - see
    // the note in the chat response for what it'd take to go further.
    useEffect(() => {
        if (!isAuthorized) return

        const interval = setInterval(() => {
            if (document.visibilityState === "visible" && !isSubmittingOrder) {
                refetch()
            }
        }, STOCK_POLL_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [isAuthorized, isSubmittingOrder, refetch])

    // Once every flagged item is fixed (removed or reduced to what's
    // actually available), drop the conflict banner on its own.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!hasStockIssues) setStockConflictNotice(false)
    }, [hasStockIssues])

    async function handleDeleteAddress(id: number) {
        if (!window.confirm("آیا از حذف این آدرس مطمئن هستید؟")) return

        setDeletingAddressId(id)
        try {
            await deleteAddress(id)
            const remaining = addresses.filter((a) => a.id !== id)
            setAddresses(remaining)
            setSelectedAddressId((prev) =>
                prev === id
                    ? (remaining.find((a) => a.is_default)?.id ?? remaining[0]?.id ?? null)
                    : prev
            )
        } catch {
            setAddressesError("حذف آدرس با خطا مواجه شد")
        } finally {
            setDeletingAddressId(null)
        }
    }

    async function handleAddressSaved(savedId: "new" | number) {
        setAddressModalOpen(false)
        setEditingAddress(null)

        if (savedId === "new") {
            setAddressesLoading(true)
            setAddressesError(null)
            try {
                const list = await getAddressList()
                setAddresses(list.results)
                const newest = [...list.results].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]
                setSelectedAddressId(newest?.id ?? null)
            } catch {
                setAddressesError("خطا در دریافت آدرس‌ها")
            } finally {
                setAddressesLoading(false)
            }
        } else {
            await fetchAddresses(savedId)
        }
    }

    async function handleSubmitOrder(e: FormEvent) {
        e.preventDefault()

        if (!selectedAddressId || isSubmittingOrder || hasStockIssues) return

        setIsSubmittingOrder(true)
        try {
            const order = await createOrder({
                address_id: selectedAddressId,
                customer_note: customerNote,
            })
            // Order creation succeeded (cart is now cleared server-side).
            // Payment is started from the order page itself, not here - so a
            // failure to create a payment link never leaves this page
            // stranded with an empty cart and no way to retry.
            router.push(`/orders/${order.token}`)
        } catch (err) {
            const conflict = extractStockConflict(err)
            if (conflict) {
                // Someone else bought part of what's in this cart between
                // the last fetch and this submit. Patch the cart's known
                // stock so the affected items light up (dimmed + badge) in
                // the summary below, and point the user at exactly what to
                // fix instead of a generic "something went wrong" dialog.
                applyStockUpdates(conflict)
                setStockConflictNotice(true)
                setIsSubmittingOrder(false)
                return
            }

            setOrderErrorMessage("ثبت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.")
            setOrderErrorOpen(true)
            setIsSubmittingOrder(false)
        }
    }

    async function handleIncreaseQuantity(item: CartItem) {
        if (item.quantity >= item.available_stock) {
            pushToast("موجودی این محصول کافی نیست")
            return
        }
        try {
            await updateQuantity(item.sku, item.quantity + 1)
        } catch {
            pushToast("بروزرسانی تعداد محصول با خطا مواجه شد")
        }
    }

    async function handleDecreaseQuantity(item: CartItem) {
        if (item.quantity <= 1) return

        try {
            await updateQuantity(item.sku, item.quantity - 1)
        } catch {
            pushToast("بروزرسانی تعداد محصول با خطا مواجه شد")
        }
    }

    // Lets an over-stock item be fixed in one tap instead of clicking "-"
    // repeatedly: drops the quantity straight down to whatever is actually
    // available right now.
    async function handleMatchAvailableStock(item: CartItem) {
        if (item.available_stock <= 0) {
            await handleRemoveItem(item)
            return
        }
        try {
            await updateQuantity(item.sku, item.available_stock)
        } catch {
            pushToast("بروزرسانی تعداد محصول با خطا مواجه شد")
        }
    }

    async function handleRemoveItem(item: CartItem) {
        try {
            await removeItem(item.sku)
        } catch {
            pushToast("حذف محصول از سبد خرید با خطا مواجه شد")
        }
    }

    const items = cart?.items ?? []
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const canSubmit = !!selectedAddressId && !hasStockIssues

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

                    <div className="mt-4 mb-12 max-w-xl sm:mb-16">
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            نهایی کردن سفارش
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                            یک آدرس تحویل انتخاب کنید تا سفارش شما ثبت شود. درگاه پرداخت را در مرحله
                            بعد، هنگام پرداخت سفارش، انتخاب می‌کنید.
                        </p>
                    </div>

                    {!isAuthorized ? (
                        <CheckoutSkeleton />
                    ) : isLoading && !cart ? (
                        <CheckoutSkeleton />
                    ) : error && !cart ? (
                        <ErrorState message={error} />
                    ) : items.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
                            {/* Address and order notes form */}
                            <form
                                id="checkout-form"
                                onSubmit={handleSubmitOrder}
                                className="flex flex-col gap-8 lg:order-1"
                            >
                                <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        <h2 className="text-base font-bold text-foreground">
                                            آدرس تحویل
                                        </h2>
                                    </div>

                                    <div className="mt-5">
                                        <AddressSection
                                            addresses={addresses}
                                            loading={addressesLoading}
                                            error={addressesError}
                                            selectedAddressId={selectedAddressId}
                                            deletingAddressId={deletingAddressId}
                                            onSelect={setSelectedAddressId}
                                            onEdit={(address) => {
                                                setEditingAddress(address)
                                                setAddressModalOpen(true)
                                            }}
                                            onDelete={handleDeleteAddress}
                                            onAddNew={() => {
                                                setEditingAddress(null)
                                                setAddressModalOpen(true)
                                            }}
                                        />
                                    </div>
                                </section>

                                <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                    <h2 className="text-base font-bold text-foreground">
                                        یادداشت سفارش
                                    </h2>
                                    <div className="mt-5">
                                        <textarea
                                            value={customerNote}
                                            onChange={(e) => setCustomerNote(e.target.value)}
                                            placeholder="در صورت تمایل، توضیحی برای سفارش خود بنویسید (اختیاری)"
                                            rows={3}
                                            className="w-full resize-none rounded-md border border-border/60 bg-transparent p-3 text-sm outline-none focus:border-foreground/40"
                                        />
                                    </div>
                                </section>

                                {stockConflictNotice && hasStockIssues && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700 dark:text-amber-400"
                                    >
                                        موجودی برخی از محصولات سبد شما در همین چند لحظه پیش توسط
                                        خریدار دیگری تغییر کرد. آیتم‌های مشخص‌شده در سبد را در سمت
                                        راست ببینید و تعداد را کاهش دهید یا آن‌ها را حذف کنید تا
                                        بتوانید سفارش را ثبت کنید.
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={!canSubmit || isSubmittingOrder}
                                    className="text-md h-11"
                                >
                                    {isSubmittingOrder
                                        ? "در حال ثبت سفارش..."
                                        : hasStockIssues
                                          ? "ابتدا سبد خرید را اصلاح کنید"
                                          : "ثبت سفارش"}
                                </Button>
                            </form>

                            {/* Order summary */}
                            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:order-2">
                                <OrderSummary
                                    items={items}
                                    itemCount={itemCount}
                                    subtotal={subtotal}
                                    canSubmit={canSubmit}
                                    hasStockIssues={hasStockIssues}
                                    isPending={isPending}
                                    onIncrease={handleIncreaseQuantity}
                                    onDecrease={handleDecreaseQuantity}
                                    onRemove={handleRemoveItem}
                                    onMatchAvailableStock={handleMatchAvailableStock}
                                />
                            </aside>
                        </div>
                    )}
                </div>

                <AddressFormDialog
                    open={addressModalOpen}
                    initialAddress={editingAddress}
                    onClose={() => {
                        setAddressModalOpen(false)
                        setEditingAddress(null)
                    }}
                    onSaved={handleAddressSaved}
                />

                <ToastStack toasts={toasts} onDismiss={dismissToast} />

                <Dialog open={orderErrorOpen} onOpenChange={setOrderErrorOpen}>
                    <DialogContent dir="rtl">
                        <DialogHeader>
                            <DialogTitle>ثبت سفارش ناموفق بود</DialogTitle>
                            <DialogDescription>{orderErrorMessage}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setOrderErrorOpen(false)}>متوجه شدم</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </PageContainer>
    )
}
