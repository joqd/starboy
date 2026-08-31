"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    Minus,
    PackageOpen,
    Pencil,
    Plus,
    ShoppingBag,
    StickyNote,
    Tag,
    Trash2,
    Wallet,
    X,
    XCircle,
    type LucideIcon,
} from "lucide-react"

import { useCart } from "@/hooks/use-cart"
import type { CartItem } from "@/types/cart"
import type { Address, AddressListItem } from "@/types/address"
import type { Gateway } from "@/types/gateway"
import {
    createAddress,
    deleteAddress,
    getAddressList,
    getCities,
    getProvinces,
    updateAddress,
} from "@/lib/api/address"
import { getGateways } from "@/lib/api/gateway"

type ProvinceOption = { id: number; name: string }
type CityOption = { id: number; name: string }
type DiscountStatus = "idle" | "loading" | "applied" | "error"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function applyDiscountCodeStub(_code: string): Promise<never> {
    await new Promise((resolve) => setTimeout(resolve, 700))
    throw new Error("امکان اعمال کد تخفیف به‌زودی فعال می‌شود")
}

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

// --- Toasts ------------------------------------------------------------
// Small, dependency-free toast system for transient errors (e.g. a failed
// quantity update) that shouldn't block or reload the whole page.

type ToastVariant = "error" | "success"
type ToastMessage = { id: number; message: string; variant: ToastVariant }

const TOAST_DURATION_MS = 4000

function useToasts() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])
    const nextId = useRef(0)

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const pushToast = useCallback(
        (message: string, variant: ToastVariant = "error") => {
            const id = nextId.current++
            setToasts((prev) => [...prev, { id, message, variant }])
            setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
        },
        [dismissToast]
    )

    return { toasts, pushToast, dismissToast }
}

function ToastStack({
    toasts,
    onDismiss,
}: {
    toasts: ToastMessage[]
    onDismiss: (id: number) => void
}) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="alert"
                    className={`flex w-full max-w-sm items-start gap-2 rounded-xl border p-3.5 text-sm shadow-lg backdrop-blur-sm sm:w-auto ${
                        toast.variant === "error"
                            ? "border-destructive/30 bg-background text-destructive"
                            : "border-emerald-500/30 bg-background text-emerald-600"
                    }`}
                >
                    {toast.variant === "error" ? (
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    ) : (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{toast.message}</span>
                    <button
                        type="button"
                        onClick={() => onDismiss(toast.id)}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="بستن پیام"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            ))}
        </div>
    )
}

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

    // --- Discount code ---------------------------------
    const [discountCode, setDiscountCode] = useState("")
    const [discountStatus, setDiscountStatus] = useState<DiscountStatus>("idle")
    const [discountMessage, setDiscountMessage] = useState<string | null>(null)

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

    async function handleApplyDiscount(e: FormEvent) {
        e.preventDefault()
        const code = discountCode.trim()
        if (!code) return

        setDiscountStatus("loading")
        setDiscountMessage(null)
        try {
            await applyDiscountCodeStub(code)
            setDiscountStatus("applied")
        } catch (err) {
            setDiscountStatus("error")
            setDiscountMessage(err instanceof Error ? err.message : "کد تخفیف نامعتبر است")
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
        <main dir="rtl" className="min-h-screen pt-16">
            <div className="mx-auto max-w-295 px-4 py-14 sm:px-6 sm:py-20 xl:px-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowRight className="size-3.5" />
                    بازگشت به فروشگاه
                </Link>

                <div className="mt-4 mb-12 max-w-xl sm:mb-16">
                    <span className="text-xs font-medium text-muted-foreground">تکمیل خرید</span>
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

                                <div className="mt-5 flex flex-col gap-3">
                                    {addressesLoading ? (
                                        <>
                                            <div className="h-20 animate-pulse rounded-xl bg-accent/60" />
                                            <div className="h-20 animate-pulse rounded-xl bg-accent/60" />
                                        </>
                                    ) : addressesError ? (
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <XCircle className="size-3.5" />
                                            {addressesError}
                                        </p>
                                    ) : addresses.length === 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingAddress(null)
                                                setAddressModalOpen(true)
                                            }}
                                            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-10 text-center transition-colors hover:border-foreground/40"
                                        >
                                            <MapPin className="size-5 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                هنوز آدرسی ثبت نکرده‌اید
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                برای ادامه، یک آدرس تحویل اضافه کنید
                                            </span>
                                        </button>
                                    ) : (
                                        <>
                                            {addresses.map((address) => (
                                                <AddressCard
                                                    key={address.id}
                                                    address={address}
                                                    selected={selectedAddressId === address.id}
                                                    deleting={deletingAddressId === address.id}
                                                    onSelect={() =>
                                                        setSelectedAddressId(address.id)
                                                    }
                                                    onEdit={() => {
                                                        setEditingAddress(address)
                                                        setAddressModalOpen(true)
                                                    }}
                                                    onDelete={() => handleDeleteAddress(address.id)}
                                                />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAddress(null)
                                                    setAddressModalOpen(true)
                                                }}
                                                className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 p-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                                            >
                                                <Plus className="size-3.5" />
                                                افزودن آدرس جدید
                                            </button>
                                        </>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <Wallet className="size-4 text-muted-foreground" />
                                    <h2 className="text-base font-bold text-foreground">
                                        درگاه پرداخت
                                    </h2>
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {gatewaysLoading ? (
                                        <>
                                            <div className="h-20 animate-pulse rounded-xl bg-accent/60" />
                                            <div className="h-20 animate-pulse rounded-xl bg-accent/60" />
                                        </>
                                    ) : gatewaysError ? (
                                        <p className="col-span-full flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <XCircle className="size-3.5" />
                                            {gatewaysError}
                                        </p>
                                    ) : gateways.length === 0 ? (
                                        <p className="col-span-full text-xs text-muted-foreground">
                                            در حال حاضر درگاه پرداختی موجود نیست
                                        </p>
                                    ) : (
                                        gateways.map((gateway) => (
                                            <PaymentOption
                                                key={gateway.id}
                                                icon={CreditCard}
                                                title={gateway.title}
                                                description={gateway.description}
                                                badge={gateway.badge}
                                                selected={selectedGatewayId === gateway.id}
                                                onSelect={() => setSelectedGatewayId(gateway.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <StickyNote className="size-4 text-muted-foreground" />
                                    <h2 className="text-base font-bold text-foreground">
                                        توضیحات سفارش
                                    </h2>
                                </div>
                                <div className="mt-5">
                                    <Field label="توضیحات (اختیاری)" name="notes" as="textarea" />
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="hidden items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
                            >
                                ثبت سفارش و پرداخت
                            </button>
                        </form>

                        {/* Order summary */}
                        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:order-2">
                            <div className="rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="size-4 text-muted-foreground" />
                                    <h2 className="text-base font-bold text-foreground">
                                        خلاصه سفارش
                                        <span className="mr-1 text-xs font-normal text-muted-foreground">
                                            ({itemCount.toLocaleString("fa-IR")} کالا)
                                        </span>
                                    </h2>
                                </div>

                                <ul className="mt-5 flex flex-col gap-4">
                                    {items.map((item) => (
                                        <CartLine
                                            key={item.sku}
                                            item={item}
                                            pending={isPending(item.sku)}
                                            onIncrease={() => handleIncreaseQuantity(item)}
                                            onDecrease={() => handleDecreaseQuantity(item)}
                                            onRemove={() => handleRemoveItem(item)}
                                        />
                                    ))}
                                </ul>

                                {/* Discount code */}
                                <form
                                    onSubmit={handleApplyDiscount}
                                    className="mt-6 border-t border-border/60 pt-5"
                                >
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Tag className="size-3.5" />
                                        کد تخفیف
                                    </label>
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            value={discountCode}
                                            onChange={(e) => {
                                                setDiscountCode(e.target.value)
                                                if (discountStatus !== "idle") {
                                                    setDiscountStatus("idle")
                                                    setDiscountMessage(null)
                                                }
                                            }}
                                            placeholder="مثلاً STAR20"
                                            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-foreground/40"
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                discountStatus === "loading" || !discountCode.trim()
                                            }
                                            className="flex shrink-0 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {discountStatus === "loading" ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                "اعمال"
                                            )}
                                        </button>
                                    </div>
                                    {discountStatus === "applied" && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                            <CheckCircle2 className="size-3.5" />
                                            کد تخفیف با موفقیت اعمال شد
                                        </p>
                                    )}
                                    {discountStatus === "error" && discountMessage && (
                                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <XCircle className="size-3.5" />
                                            {discountMessage}
                                        </p>
                                    )}
                                </form>

                                {/* Grand total */}
                                <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-5 text-sm">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>جمع جزء</span>
                                        <span className="text-foreground">
                                            {formatToman(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>هزینه ارسال</span>
                                        <span className="text-xs">
                                            پس از ثبت سفارش محاسبه می‌شود
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 text-base font-bold text-foreground">
                                        <span>مبلغ قابل پرداخت</span>
                                        <span>{formatToman(subtotal)}</span>
                                    </div>
                                </div>

                                {!canSubmit && (
                                    <p className="mt-4 text-center text-xs text-muted-foreground">
                                        برای ثبت سفارش، آدرس تحویل و درگاه پرداخت را انتخاب کنید
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={!canSubmit}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                                >
                                    ثبت سفارش و پرداخت
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <AddressFormModal
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
    )
}

function Field({
    label,
    name,
    type = "text",
    required,
    as = "input",
    icon: Icon,
}: {
    label: string
    name: string
    type?: string
    required?: boolean
    as?: "input" | "textarea"
    icon?: LucideIcon
}) {
    const sharedClassName =
        "w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-foreground/40"

    return (
        <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                {Icon && <Icon className="size-3.5" />}
                {label}
                {required && <span className="text-foreground/60">*</span>}
            </span>
            {as === "textarea" ? (
                <textarea name={name} required={required} rows={3} className={sharedClassName} />
            ) : (
                <input name={name} type={type} required={required} className={sharedClassName} />
            )}
        </label>
    )
}

function PaymentOption({
    icon: Icon,
    title,
    description,
    badge,
    selected,
    onSelect,
}: {
    icon: LucideIcon
    title: string
    description: string
    badge?: string
    selected: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex items-start gap-3 rounded-xl border p-4 text-right transition-colors ${
                selected ? "border-foreground/60 bg-accent" : "border-border/60 hover:bg-accent/60"
            }`}
        >
            {badge ? (
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
                    <Image
                        src={badge}
                        alt=""
                        width={24}
                        height={24}
                        className="h-8 w-8 object-contain"
                        unoptimized={badge.endsWith(".svg")}
                    />
                </span>
            ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                    <Icon className="size-[1.15rem] text-foreground" />
                </div>
            )}
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
            </div>
        </button>
    )
}

function AddressCard({
    address,
    selected,
    deleting,
    onSelect,
    onEdit,
    onDelete,
}: {
    address: AddressListItem
    selected: boolean
    deleting: boolean
    onSelect: () => void
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect()
                }
            }}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-right transition-colors ${
                selected ? "border-foreground/60 bg-accent" : "border-border/60 hover:bg-accent/60"
            }`}
        >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                <MapPin className="size-[1.15rem] text-foreground" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{address.title}</span>
                    {address.is_default && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                            پیش‌فرض
                        </span>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    {address.recipient_name} · {address.phone}
                </span>
                <span className="text-xs text-muted-foreground">
                    {address.province.name}، {address.city.name} — {address.address_line}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                    }}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label="ویرایش آدرس"
                >
                    <Pencil className="size-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                    }}
                    disabled={deleting}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-destructive disabled:opacity-40"
                    aria-label="حذف آدرس"
                >
                    {deleting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="size-3.5" />
                    )}
                </button>
            </div>
        </div>
    )
}

function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-xl">
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="بستن"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="overflow-y-auto px-5 py-5">{children}</div>
            </div>
        </div>
    )
}

function ModalField({
    label,
    value,
    onChange,
    type = "text",
    required,
    as = "input",
}: {
    label: string
    value: string
    onChange: (value: string) => void
    type?: string
    required?: boolean
    as?: "input" | "textarea"
}) {
    const sharedClassName =
        "w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-foreground/40"

    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
                {required && <span className="text-foreground/60"> *</span>}
            </span>
            {as === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    rows={3}
                    className={sharedClassName}
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type={type}
                    required={required}
                    className={sharedClassName}
                />
            )}
        </label>
    )
}

function SelectField({
    label,
    value,
    onChange,
    options,
    loading,
    disabled,
    required,
}: {
    label: string
    value: number | ""
    onChange: (value: number | "") => void
    options: { value: number; label: string }[]
    loading?: boolean
    disabled?: boolean
    required?: boolean
}) {
    const sharedClassName =
        "w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"

    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
                {required && <span className="text-foreground/60"> *</span>}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
                disabled={disabled || loading}
                required={required}
                className={sharedClassName}
            >
                <option value="">{loading ? "در حال بارگذاری..." : "انتخاب کنید"}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    )
}

function AddressFormModal({
    open,
    initialAddress,
    onClose,
    onSaved,
}: {
    open: boolean
    initialAddress: AddressListItem | null
    onClose: () => void
    onSaved: (savedId: "new" | number) => void
}) {
    const isEditing = !!initialAddress

    const [title, setTitle] = useState("")
    const [recipientName, setRecipientName] = useState("")
    const [phone, setPhone] = useState("")
    const [provinceId, setProvinceId] = useState<number | "">("")
    const [cityId, setCityId] = useState<number | "">("")
    const [postalCode, setPostalCode] = useState("")
    const [addressLine, setAddressLine] = useState("")
    const [isDefault, setIsDefault] = useState(false)

    const [provinces, setProvinces] = useState<ProvinceOption[]>([])
    const [provincesLoading, setProvincesLoading] = useState(false)
    const [cities, setCities] = useState<CityOption[]>([])
    const [citiesLoading, setCitiesLoading] = useState(false)

    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Every time the modal opens, initialize the form from the address being edited (or empty)
    useEffect(() => {
        if (!open) return

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormError(null)
        setTitle(initialAddress?.title ?? "")
        setRecipientName(initialAddress?.recipient_name ?? "")
        setPhone(initialAddress?.phone ?? "")
        setPostalCode(initialAddress?.postal_code ?? "")
        setAddressLine(initialAddress?.address_line ?? "")
        setIsDefault(initialAddress?.is_default ?? false)
        setProvinceId(initialAddress?.province.id ?? "")
        setCityId(initialAddress?.city.id ?? "")

        setProvincesLoading(true)
        getProvinces()
            .then((res) => setProvinces(res.results))
            .catch(() => setFormError("خطا در دریافت لیست استان‌ها"))
            .finally(() => setProvincesLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialAddress?.id])

    // When the province changes, fetch the list of cities for that province
    useEffect(() => {
        if (!provinceId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCities([])
            return
        }
        setCitiesLoading(true)
        getCities(provinceId)
            .then((res) => setCities(res.results))
            .catch(() => setFormError("خطا در دریافت لیست شهرها"))
            .finally(() => setCitiesLoading(false))
    }, [provinceId])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!provinceId || !cityId) {
            setFormError("لطفاً استان و شهر را انتخاب کنید")
            return
        }

        setSubmitting(true)
        setFormError(null)

        const payload: Address = {
            title,
            recipient_name: recipientName,
            phone,
            province: provinceId,
            city: cityId,
            postal_code: postalCode,
            address_line: addressLine,
            is_default: isDefault,
        }

        try {
            if (isEditing && initialAddress) {
                await updateAddress(initialAddress.id, payload)
                onSaved(initialAddress.id)
            } else {
                await createAddress(payload)
                onSaved("new")
            }
        } catch {
            setFormError("ذخیره آدرس با خطا مواجه شد. دوباره تلاش کنید")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? "ویرایش آدرس" : "افزودن آدرس جدید"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <ModalField
                    label="عنوان آدرس (مثلاً خانه، محل کار)"
                    value={title}
                    onChange={setTitle}
                    required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <ModalField
                        label="نام گیرنده"
                        value={recipientName}
                        onChange={setRecipientName}
                        required
                    />
                    <ModalField
                        label="شماره موبایل"
                        value={phone}
                        onChange={setPhone}
                        type="tel"
                        required
                    />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="استان"
                        value={provinceId}
                        onChange={(v) => {
                            setProvinceId(v)
                            setCityId("")
                        }}
                        options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                        loading={provincesLoading}
                        required
                    />
                    <SelectField
                        label="شهر"
                        value={cityId}
                        onChange={setCityId}
                        options={cities.map((c) => ({ value: c.id, label: c.name }))}
                        loading={citiesLoading}
                        disabled={!provinceId}
                        required
                    />
                </div>
                <ModalField label="کد پستی" value={postalCode} onChange={setPostalCode} required />
                <ModalField
                    label="آدرس کامل"
                    value={addressLine}
                    onChange={setAddressLine}
                    as="textarea"
                    required
                />

                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="size-3.5 rounded border-border/60"
                    />
                    این آدرس به‌عنوان آدرس پیش‌فرض ذخیره شود
                </label>

                {formError && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <XCircle className="size-3.5" />
                        {formError}
                    </p>
                )}

                <div className="mt-2 flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                        {submitting && <Loader2 className="size-3.5 animate-spin" />}
                        {isEditing ? "ذخیره تغییرات" : "افزودن آدرس"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                        انصراف
                    </button>
                </div>
            </form>
        </Modal>
    )
}

function CartLine({
    item,
    pending,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    item: CartItem
    pending: boolean
    onIncrease: () => void
    onDecrease: () => void
    onRemove: () => void
}) {
    const canIncrease = !pending && item.quantity < item.available_stock
    const canDecrease = !pending && item.quantity > 1

    return (
        <li className="flex items-center gap-3">
            <div className="relative flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.product_title}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                ) : (
                    <ShoppingBag className="size-5 text-muted-foreground" />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">
                    {item.product_title}
                </span>
                <span className="text-xs text-muted-foreground">
                    {item.size}
                </span>

                <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border/60">
                        <button
                            type="button"
                            onClick={onDecrease}
                            disabled={!canDecrease}
                            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            aria-label="کاهش تعداد"
                        >
                            <Minus className="size-3.5" />
                        </button>
                        <span className="flex w-5 items-center justify-center text-center text-xs font-medium text-foreground">
                            {pending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                item.quantity.toLocaleString("fa-IR")
                            )}
                        </span>
                        <button
                            type="button"
                            onClick={onIncrease}
                            disabled={!canIncrease}
                            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            aria-label="افزایش تعداد"
                        >
                            <Plus className="size-3.5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={pending}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                    >
                        <Trash2 className="size-3.5" />
                        حذف
                    </button>
                </div>
            </div>

            <span className="shrink-0 text-sm font-bold text-foreground">
                {formatToman(item.price * item.quantity)}
            </span>
        </li>
    )
}

function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-accent">
                <PackageOpen className="size-6 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">سبد خرید شما خالی است</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    برای ادامه، ابتدا چند محصول به سبد خرید خود اضافه کنید.
                </p>
            </div>
            <Link
                href="/"
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
                مشاهده محصولات
            </Link>
        </div>
    )
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 px-6 py-20 text-center">
            <XCircle className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
    )
}

function CheckoutSkeleton() {
    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-8">
                <div className="h-56 animate-pulse rounded-xl bg-accent/60" />
                <div className="h-32 animate-pulse rounded-xl bg-accent/60" />
            </div>
            <div className="h-96 animate-pulse rounded-xl bg-accent/60" />
        </div>
    )
}
