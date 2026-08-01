"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, type PanInfo } from "motion/react"
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Heart,
    Lock,
    Minus,
    Plus,
    X,
    ZoomIn,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"

type Props = {
    product: ProductDetail
}

export default function ProductView({ product }: Props) {
    const images =
        product.images.length > 0
            ? product.images
            : [
                  {
                      id: 0,
                      image: "",
                      media_kind: "gallery",
                      caption: "",
                      alt_text: product.title,
                      is_primary: true,
                  },
              ]

    const sortedVariants = [...product.variants].sort((a, b) => a.size - b.size)

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        sortedVariants.find((v) => v.is_active && v.stock > 0)?.id ?? null
    )
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(product.is_in_wishlist)
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)

    const selectedVariant = sortedVariants.find((v) => v.id === selectedVariantId) ?? null
    const productHasStock = sortedVariants.some((v) => v.stock > 0 && v.is_active)
    const canAddToCart = selectedVariant !== null && selectedVariant.stock > 0

    const displayPrice = selectedVariant?.price ?? sortedVariants[0]?.price ?? 0
    const comparePrice = selectedVariant?.compare_price ?? sortedVariants[0]?.compare_price ?? null
    const discountPercent =
        comparePrice && comparePrice > displayPrice
            ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
            : null

    return (
        <div
            dir="rtl"
            className="relative h-screen w-full overflow-hidden bg-black text-neutral-50"
        >
            {/* گالری تمام‌صفحه که به‌عنوان پس‌زمینه عمل می‌کند */}
            <Gallery images={images} hasStock={productHasStock} onZoom={setZoomedImage} />

            {/* کارت شناور اطلاعات محصول */}
            <div
                className={cn(
                    "absolute z-20 flex max-h-[88vh] w-[92vw] max-w-sm flex-col gap-3 overflow-hidden rounded-3xl border border-neutral-400/20 bg-black/55 p-4 backdrop-blur-xl",
                    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "lg:top-6 lg:right-6 lg:left-auto lg:translate-x-0 lg:translate-y-0"
                )}
            >
                <Link
                    href="/"
                    className="flex w-fit items-center gap-1.5 rounded-full border border-neutral-400/30 px-2.5 py-1 text-[11px] text-neutral-400 transition hover:border-neutral-50 hover:text-neutral-50"
                >
                    <ArrowRight className="h-3 w-3" />
                    بازگشت
                </Link>

                <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-0.5">
                    {product.collections.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {product.collections.map((c) => (
                                <span
                                    key={c.id}
                                    className="rounded-full border border-neutral-400/30 px-2 py-0.5 text-[9px] tracking-wide text-neutral-400 uppercase"
                                >
                                    {c.title}
                                </span>
                            ))}
                        </div>
                    )}

                    <div>
                        <h1 className="colored text-[22px] leading-[0.95] font-bold tracking-tight uppercase">
                            {product.title}
                        </h1>
                        {product.short_description && (
                            <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
                                {product.short_description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold">
                            {formatPrice(displayPrice)} تومان
                        </span>
                        {comparePrice && comparePrice > displayPrice && (
                            <>
                                <span className="text-[11px] text-neutral-500 line-through">
                                    {formatPrice(comparePrice)}
                                </span>
                                <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-medium text-red-500">
                                    {discountPercent}٪-
                                </span>
                            </>
                        )}
                    </div>

                    {sortedVariants.length > 0 && (
                        <div>
                            <p className="mb-1.5 text-[9px] tracking-wide text-neutral-400 uppercase">
                                سایز
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {sortedVariants.map((variant) => {
                                    const disabled = !variant.is_active || variant.stock <= 0
                                    const active = variant.id === selectedVariantId
                                    return (
                                        <button
                                            key={variant.id}
                                            disabled={disabled}
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            className={cn(
                                                "relative flex h-10 w-9 items-center justify-center rounded-lg border text-[11px] transition",
                                                active
                                                    ? "border-neutral-50 bg-neutral-50 text-black"
                                                    : "border-neutral-400/30 text-neutral-50 hover:border-neutral-50",
                                                disabled &&
                                                    "cursor-not-allowed border-neutral-400/20 text-neutral-600 line-through opacity-50 hover:border-neutral-400/20"
                                            )}
                                        >
                                            {variant.size_name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center rounded-full border border-neutral-400/30">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:text-neutral-50"
                                aria-label="کاهش تعداد"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-4 text-center text-[11px]">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:text-neutral-50"
                                aria-label="افزایش تعداد"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>

                        <button
                            disabled={!canAddToCart}
                            className={cn(
                                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[11px] font-medium transition",
                                canAddToCart
                                    ? "bg-neutral-50 text-black hover:bg-white"
                                    : "cursor-not-allowed bg-neutral-800 text-neutral-500"
                            )}
                        >
                            {canAddToCart ? (
                                "افزودن به سبد خرید"
                            ) : (
                                <>
                                    <Lock className="h-3 w-3" strokeWidth={1.8} />
                                    ناموجود
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setWishlisted((w) => !w)}
                            aria-label="افزودن به علاقه‌مندی‌ها"
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                                wishlisted
                                    ? "border-red-500 text-red-500"
                                    : "border-neutral-400/30 text-neutral-400 hover:text-neutral-50"
                            )}
                        >
                            <Heart
                                className="h-3.5 w-3.5"
                                fill={wishlisted ? "currentColor" : "none"}
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>

                    {product.description && (
                        <div className="border-t border-neutral-400/20 pt-2.5">
                            <p className="text-[11px] leading-5 whitespace-pre-line text-neutral-400">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Lightbox src={zoomedImage} onClose={() => setZoomedImage(null)} />
        </div>
    )
}

/**
 * گالری تمام‌صفحه با drag/سوایپ برای جابه‌جایی و دکمه‌ی بزرگ‌نمایی برای دیدن
 * تصویر در سایز کامل (Lightbox). بدون هیچ افکت پارالاکس/تیلتی روی خود تصویر.
 */
function Gallery({
    images,
    hasStock,
    onZoom,
}: {
    images: ProductDetail["images"]
    hasStock: boolean
    onZoom: (src: string) => void
}) {
    const [active, setActive] = useState(0)
    const hasMultiple = images.length > 1

    const goTo = (i: number) => setActive(((i % images.length) + images.length) % images.length)

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (!hasMultiple) return
        if (info.offset.x < -60) goTo(active + 1)
        else if (info.offset.x > 60) goTo(active - 1)
    }

    const current = images[active]

    return (
        <div className="absolute inset-0">
            {/* لایه‌ی محیطی: همان تصویر ولی بزرگ‌نمایی‌شده و بلاردار. چون از
                قبل تار است، هیچ افت کیفیتی در آن دیده نمی‌شود و فقط اتمسفر
                رنگی پس‌زمینه را می‌سازد؛ عکس واقعی و شارپ در قاب زیر است. */}
            {current?.image && (
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src={current.image}
                        alt=""
                        aria-hidden
                        fill
                        sizes="100vw"
                        quality={40}
                        className="scale-125 object-cover blur-3xl brightness-[0.45] saturate-150"
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-black/25" />

            {/* قاب اصلی: عکس در اندازه‌ی محدود و واقعی رندر می‌شود، بدون
                کشیده‌شدن روی کل صفحه، پس شارپ و باکیفیت می‌ماند */}
            <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    className="relative aspect-[4/5] h-full max-h-[78vh] w-auto max-w-full overflow-hidden rounded-3xl border border-neutral-400/20 shadow-2xl shadow-black/60"
                    drag={hasMultiple ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current?.id ?? active}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="absolute inset-0"
                        >
                            {current?.image && (
                                <Image
                                    src={current.image}
                                    alt={current.alt_text || "تصویر محصول"}
                                    fill
                                    sizes="(min-width: 1024px) 640px, 92vw"
                                    quality={95}
                                    draggable={false}
                                    priority={active === 0}
                                    className={cn(
                                        "object-cover select-none",
                                        !hasStock && "blur-sm brightness-75 grayscale"
                                    )}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {current?.image && (
                        <button
                            onClick={() => onZoom(current.image)}
                            aria-label="نمایش تصویر در سایز کامل"
                            className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-neutral-200 backdrop-blur-md transition hover:bg-black/60"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    )}

                    {!hasStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div
                                className="flex flex-col items-center gap-1.5 text-neutral-50"
                                style={{
                                    textShadow: `0 1px 2px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,.8), 0 0 16px rgba(0,0,0,.5)`,
                                }}
                            >
                                <Lock className="h-8 w-8" strokeWidth={1.8} />
                                <p className="text-sm font-medium tracking-wide">ناموجود</p>
                            </div>
                        </div>
                    )}

                    {hasMultiple && (
                        <>
                            <button
                                onClick={() => goTo(active - 1)}
                                aria-label="تصویر قبلی"
                                className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-neutral-200 backdrop-blur-md transition hover:bg-black/60"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => goTo(active + 1)}
                                aria-label="تصویر بعدی"
                                className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-neutral-200 backdrop-blur-md transition hover:bg-black/60"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => goTo(i)}
                                        aria-label={`تصویر ${i + 1}`}
                                        className={cn(
                                            "h-1 rounded-full transition-all",
                                            i === active
                                                ? "w-5 bg-neutral-50"
                                                : "w-1 bg-neutral-50/40"
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

/** نمایش تصویر در سایز کامل با قابلیت بستن با کلیک بیرون یا دکمه‌ی X */
function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
    return (
        <AnimatePresence>
            {src && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                >
                    <button
                        onClick={onClose}
                        aria-label="بستن"
                        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-400/30 text-neutral-200 transition hover:border-neutral-50 hover:text-neutral-50"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative h-[85vh] w-[92vw] max-w-3xl"
                    >
                        <Image
                            src={src}
                            alt="نمایش کامل تصویر محصول"
                            fill
                            sizes="92vw"
                            quality={95}
                            className="object-contain"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
