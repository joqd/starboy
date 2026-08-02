"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, type PanInfo } from "motion/react"
import { ArrowRight, ChevronLeft, ChevronRight, Lock, Minus, Plus, X, ZoomIn } from "lucide-react"
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
            className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row"
        >
            <div className="relative order-1 h-[46vh] w-full shrink-0 lg:order-2 lg:h-full lg:flex-1">
                <Gallery images={images} hasStock={productHasStock} onZoom={setZoomedImage} />
            </div>

            <div
                className={cn(
                    "order-2 flex min-h-0 flex-1 flex-col lg:order-1",
                    "border lg:h-full lg:w-105 lg:flex-none lg:justify-center lg:border-l xl:w-115"
                )}
            >
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 lg:flex-none lg:px-8 lg:py-10">
                    <Link
                        href="/"
                        className="flex w-fit items-center gap-1.5 px-3 py-1.5 text-[11px] text-muted-foreground"
                    >
                        <ArrowRight className="h-3 w-3" />
                        بازگشت
                    </Link>

                    {product.collections.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {product.collections.map((c) => (
                                <span
                                    key={c.id}
                                    className="rounded-full border border-border/70 bg-muted/70 px-2.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase"
                                >
                                    {c.title}
                                </span>
                            ))}
                        </div>
                    )}

                    <div>
                        <h1 className="text-[28px] leading-[1.05] font-bold tracking-tight text-primary uppercase lg:text-[32px]">
                            {product.title}
                        </h1>
                        {product.short_description && (
                            <p className="mt-3 text-[13px] leading-relaxed">
                                {product.short_description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2.5">
                        <span className="text-xl font-bold">{formatPrice(displayPrice)} تومان</span>
                        {comparePrice && comparePrice > displayPrice && (
                            <>
                                <span className="text-[12px] line-through">
                                    {formatPrice(comparePrice)}
                                </span>
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium">
                                    {discountPercent}٪-
                                </span>
                            </>
                        )}
                    </div>

                    {sortedVariants.length > 0 && (
                        <div>
                            <p className="mb-2 text-[10px] font-medium tracking-wide uppercase">
                                سایز
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sortedVariants.map((variant) => {
                                    const disabled = !variant.is_active || variant.stock <= 0
                                    const active = variant.id === selectedVariantId
                                    return (
                                        <button
                                            key={variant.id}
                                            disabled={disabled}
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            className={cn(
                                                "font-inter relative flex h-11 min-w-11 items-center justify-center rounded-xl border px-2 text-xs font-semibold transition active:scale-[0.96]",
                                                active
                                                    ? "bg-primary text-background dark:text-pink-100"
                                                    : "border-border bg-background text-foreground",
                                                disabled &&
                                                    "cursor-not-allowed border-border/60 bg-muted/60 text-muted-foreground line-through opacity-60"
                                            )}
                                        >
                                            {variant.size_name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <div className="flex h-11 items-center rounded-xl border border-border bg-background">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="flex h-full w-9 items-center justify-center text-muted-foreground active:scale-90"
                                aria-label="کاهش تعداد"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-inter w-5 text-center text-[12px] font-bold text-foreground tabular-nums">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="flex h-full w-9 items-center justify-center text-muted-foreground active:scale-90"
                                aria-label="افزایش تعداد"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <button
                            disabled={!canAddToCart}
                            className={cn(
                                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 text-[13px] font-bold transition active:scale-[0.98]",
                                canAddToCart
                                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "cursor-not-allowed border-border bg-muted text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {canAddToCart ? (
                                "افزودن به سبد خرید"
                            ) : (
                                <>
                                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    ناموجود
                                </>
                            )}
                        </button>
                    </div>

                    {product.description && (
                        <div className="border-t pt-4">
                            <p className="text-[12.5px] leading-6 whitespace-pre-line">
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

function Gallery({
    images,
    hasStock,
    onZoom,
}: {
    images: ProductDetail["images"]
    hasStock: boolean
    onZoom: (src: string) => void
}) {
    const [[active, direction], setActive] = useState<[number, number]>([0, 0])
    const hasMultiple = images.length > 1

    const goTo = (i: number, dir: number) => {
        const next = ((i % images.length) + images.length) % images.length
        if (next === active) return
        setActive([next, dir])
    }

    const SWIPE_OFFSET_THRESHOLD = 42
    const SWIPE_VELOCITY_THRESHOLD = 380

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (!hasMultiple) return
        const { offset, velocity } = info
        if (offset.x < -SWIPE_OFFSET_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
            goTo(active + 1, 1)
        } else if (offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
            goTo(active - 1, -1)
        }
    }

    const current = images[active]

    const slideVariants = {
        enter: (dir: number) => ({
            opacity: 0,
            scale: 1.02,
            x: dir >= 0 ? "3%" : "-3%",
        }),
        center: { opacity: 1, scale: 1, x: "0%" },
        exit: (dir: number) => ({
            opacity: 0,
            scale: 0.98,
            x: dir >= 0 ? "-3%" : "3%",
        }),
    }

    return (
        <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                <motion.div
                    key={current?.id ?? active}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    drag={hasMultiple ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.035}
                    dragTransition={{ bounceStiffness: 800, bounceDamping: 48 }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0"
                >
                    {current?.image && (
                        <Image
                            src={current.image}
                            alt={current.alt_text || "تصویر محصول"}
                            fill
                            sizes="(min-width: 1024px) 60vw, 100vw"
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

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/45 to-transparent" />

            {current?.image && (
                <button
                    onClick={() => onZoom(current.image)}
                    aria-label="نمایش تصویر در سایز کامل"
                    className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-50 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
            )}

            {!hasStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div
                        className="flex flex-col items-center gap-1.5"
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
                        onClick={() => goTo(active - 1, -1)}
                        aria-label="تصویر قبلی"
                        className="absolute top-1/2 right-4 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-50 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => goTo(active + 1, 1)}
                        aria-label="تصویر بعدی"
                        className="absolute top-1/2 left-4 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-50 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {images.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => goTo(i, i > active ? 1 : -1)}
                                aria-label={`تصویر ${i + 1}`}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-200",
                                    i === active ? "w-6 bg-primary" : "w-1.5 bg-background/70"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
    return (
        <AnimatePresence>
            {src && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                >
                    <button
                        onClick={onClose}
                        aria-label="بستن"
                        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
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
