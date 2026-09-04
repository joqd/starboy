"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { ArrowRight, MapPin, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import type { CartItem } from "@/types/cart"
import type { AddressListItem } from "@/types/address"
import type { Gateway } from "@/types/gateway"
import { deleteAddress, getAddressList } from "@/lib/api/address"
import { getGateways } from "@/lib/api/gateway"

import { useToasts, ToastStack } from "@/components/checkout/toast-stack"
import { AddressSection } from "@/components/checkout/address-section"
import { AddressFormDialog } from "@/components/checkout/address-form-dialog"
import { PaymentSection } from "@/components/checkout/payment-section"
import { OrderSummary } from "@/components/checkout/order-summary"
import { CheckoutSkeleton, EmptyCart, ErrorState } from "@/components/checkout/checkout-states"

export default function CheckoutPage() {
    const { cart, isLoading, error, itemCount, updateQuantity, removeItem, isPending } = useCart()
    const { toasts, pushToast, dismissToast } = useToasts()

    // --- Addresses -----------------------------------------------------
    const [addresses, setAddresses] = useState<AddressListItem[]>([])
    const [addressesLoading, setAddressesLoading] = useState(true)
    const [addressesError, setAddressesError] = useState<string | null>(null)
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
    const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null)

    const [addressModalOpen, setAddressModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<AddressListItem | null>(null)

    // --- Payment gateways ------------------------------------------------------
    const [gateways, setGateways] = useState<Gateway[]>([])
    const [gatewaysLoading, setGatewaysLoading] = useState(true)
    const [gatewaysError, setGatewaysError] = useState<string | null>(null)
    const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null)

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

    useEffect(() => {
        let cancelled = false

        async function loadGateways() {
            setGatewaysLoading(true)
            setGatewaysError(null)
            try {
                const list = await getGateways()
                if (cancelled) return
                setGateways(list)
                setSelectedGatewayId((prev) => prev ?? list[0]?.id ?? null)
            } catch {
                if (!cancelled) setGatewaysError("خطا در دریافت درگاه‌های پرداخت")
            } finally {
                if (!cancelled) setGatewaysLoading(false)
            }
        }

        loadGateways()
        return () => {
            cancelled = true
        }
    }, [])

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

    function handleSubmitOrder(e: FormEvent) {
        e.preventDefault()
        // TODO(backend): wire up the order-submission endpoint (sending
        // selectedAddressId and selectedGatewayId) and redirect to the payment gateway
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

    async function handleRemoveItem(item: CartItem) {
        try {
            await removeItem(item.sku)
        } catch {
            pushToast("حذف محصول از سبد خرید با خطا مواجه شد")
        }
    }

    const items = cart?.items ?? []
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const canSubmit = !!selectedAddressId && !!selectedGatewayId

    return (
        <PageContainer>
            <main dir="rtl" className="min-h-screen">
                <div className="">
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
                            یک آدرس تحویل و یک درگاه پرداخت انتخاب کنید تا سفارش شما ثبت شود.
                        </p>
                    </div>

                    {isLoading && !cart ? (
                        <CheckoutSkeleton />
                    ) : error && !cart ? (
                        <ErrorState message={error} />
                    ) : items.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
                            {/* Address, payment gateway, and order notes form */}
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
                                    <div className="flex items-center gap-2">
                                        <Wallet className="size-4 text-muted-foreground" />
                                        <h2 className="text-base font-bold text-foreground">
                                            درگاه پرداخت
                                        </h2>
                                    </div>
                                    <div className="mt-5">
                                        <PaymentSection
                                            gateways={gateways}
                                            loading={gatewaysLoading}
                                            error={gatewaysError}
                                            selectedGatewayId={selectedGatewayId}
                                            onSelect={setSelectedGatewayId}
                                        />
                                    </div>
                                </section>

                                <Button disabled={!canSubmit} className="text-md h-11">
                                    ثبت سفارش و پرداخت
                                </Button>
                            </form>

                            {/* Order summary */}
                            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:order-2">
                                <OrderSummary
                                    items={items}
                                    itemCount={itemCount}
                                    subtotal={subtotal}
                                    canSubmit={canSubmit}
                                    isPending={isPending}
                                    onIncrease={handleIncreaseQuantity}
                                    onDecrease={handleDecreaseQuantity}
                                    onRemove={handleRemoveItem}
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
            </main>
        </PageContainer>
    )
}
