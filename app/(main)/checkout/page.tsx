"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import {
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Loader2,
    Minus,
    PackageOpen,
    Plus,
    ShoppingBag,
    StickyNote,
    Tag,
    Trash2,
    Truck,
    User,
    Wallet,
    XCircle,
    type LucideIcon,
} from "lucide-react"

import { useCart } from "@/hooks/use-cart"
import type { Cart } from "@/types/cart"

// نوع هر آیتم سبد خرید را از روی خود Cart استخراج می‌کنیم تا وابسته به
// اسم دقیق تایپ export‌شده در types/cart نباشیم.
type CartItem = Cart["items"][number]

type PaymentMethod = "online" | "cod"
type DiscountStatus = "idle" | "loading" | "applied" | "error"

// -----------------------------------------------------------------------
// TODO(backend): این بخش هنوز به بک‌اند وصل نیست. به محض آماده شدن
// اندپوینت اعمال کد تخفیف، این تابع را با فراخوانی واقعی (مثلاً تابعی در
// lib/api/cart به اسم applyDiscountCode) جایگزین کنید.
// -----------------------------------------------------------------------
async function applyDiscountCodeStub(_code: string): Promise<never> {
    await new Promise((resolve) => setTimeout(resolve, 700))
    throw new Error("امکان اعمال کد تخفیف به‌زودی فعال می‌شود")
}

// قیمت واحد و نام/تصویر هر آیتم را با احتیاط از فیلدهای رایج احتمالی
// می‌خوانیم. اگر نوع Cart شما اسم فیلد دیگری برای اینها دارد
// (مثلاً unit_price یا thumbnailUrl) همین‌جا اصلاح کنید.
function getUnitPrice(item: CartItem): number {
    const raw = item as unknown as Record<string, unknown>
    const price = raw.price ?? raw.unitPrice ?? raw.salePrice ?? 0
    return typeof price === "number" ? price : Number(price) || 0
}

function getItemName(item: CartItem): string {
    const raw = item as unknown as Record<string, unknown>
    return (raw.name as string) ?? (raw.title as string) ?? item.sku
}

function getItemImage(item: CartItem): string | undefined {
    const raw = item as unknown as Record<string, unknown>
    return (raw.image as string) ?? (raw.imageUrl as string) ?? (raw.thumbnail as string)
}

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

export default function CheckoutPage() {
    const { cart, isLoading, error, itemCount, updateQuantity, removeItem, isPending } = useCart()

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online")
    const [discountCode, setDiscountCode] = useState("")
    const [discountStatus, setDiscountStatus] = useState<DiscountStatus>("idle")
    const [discountMessage, setDiscountMessage] = useState<string | null>(null)

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
        // TODO(backend): اتصال به اندپوینت ثبت سفارش و انتقال به درگاه پرداخت
    }

    const items = cart?.items ?? []
    const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)

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
                        اطلاعات ارسال را تکمیل کنید و روش پرداخت خود را انتخاب کنید.
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
                        {/* فرم اطلاعات ارسال و پرداخت */}
                        <form
                            id="checkout-form"
                            onSubmit={handleSubmitOrder}
                            className="flex flex-col gap-8 lg:order-1"
                        >
                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <User className="size-4 text-muted-foreground" />
                                    <h2 className="text-base font-bold text-foreground">
                                        اطلاعات گیرنده
                                    </h2>
                                </div>
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <Field label="نام و نام خانوادگی" name="fullName" required />
                                    <Field label="شماره موبایل" name="phone" type="tel" required />
                                    <Field label="شهر" name="city" required />
                                    <Field label="کد پستی" name="postalCode" />
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="آدرس کامل"
                                            name="address"
                                            as="textarea"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="توضیحات (اختیاری)"
                                            name="notes"
                                            as="textarea"
                                            icon={StickyNote}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/60 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <Wallet className="size-4 text-muted-foreground" />
                                    <h2 className="text-base font-bold text-foreground">
                                        روش پرداخت
                                    </h2>
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <PaymentOption
                                        icon={CreditCard}
                                        title="پرداخت آنلاین"
                                        description="پرداخت امن از طریق درگاه بانکی"
                                        selected={paymentMethod === "online"}
                                        onSelect={() => setPaymentMethod("online")}
                                    />
                                    <PaymentOption
                                        icon={Truck}
                                        title="پرداخت در محل"
                                        description="پرداخت هنگام تحویل سفارش"
                                        selected={paymentMethod === "cod"}
                                        onSelect={() => setPaymentMethod("cod")}
                                    />
                                </div>
                            </section>

                            <button
                                type="submit"
                                className="hidden items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 lg:inline-flex"
                            >
                                ثبت سفارش و پرداخت
                            </button>
                        </form>

                        {/* خلاصه سفارش */}
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
                                            onIncrease={() =>
                                                updateQuantity(item.sku, item.quantity + 1)
                                            }
                                            onDecrease={() =>
                                                updateQuantity(item.sku, item.quantity - 1)
                                            }
                                            onRemove={() => removeItem(item.sku)}
                                        />
                                    ))}
                                </ul>

                                {/* کد تخفیف */}
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

                                {/* جمع کل */}
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

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 lg:hidden"
                                >
                                    ثبت سفارش و پرداخت
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
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
    selected,
    onSelect,
}: {
    icon: LucideIcon
    title: string
    description: string
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
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                <Icon className="size-[1.15rem] text-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
            </div>
        </button>
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
    const name = getItemName(item)
    const image = getItemImage(item)
    const unitPrice = getUnitPrice(item)

    return (
        <li className="flex items-center gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent">
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={name} className="size-full object-cover" />
                ) : (
                    <ShoppingBag className="size-5 text-muted-foreground" />
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-medium text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{formatToman(unitPrice)}</span>

                <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border/60">
                        <button
                            type="button"
                            onClick={onDecrease}
                            disabled={pending}
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
                            disabled={pending}
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
                {formatToman(unitPrice * item.quantity)}
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
