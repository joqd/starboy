"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, type PanInfo } from "motion/react"
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Lock,
    Minus,
    Music,
    Pause,
    Plus,
    X,
    ZoomIn,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { ButtonGroup } from "@/components/ui/button-group"
import { useCart } from "@/hooks/use-cart"
import { useAudio } from "@/hooks/use-audio"

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
    const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)
    const [addToCartError, setAddToCartError] = useState<string | null>(null)

    const selectedVariant = sortedVariants.find((v) => v.id === selectedVariantId) ?? null
    const productHasStock = sortedVariants.some((v) => v.stock > 0 && v.is_active)

    const displayPrice = selectedVariant?.price ?? sortedVariants[0]?.price ?? 0
    const comparePrice = selectedVariant?.compare_price ?? sortedVariants[0]?.compare_price ?? null
    const discountPercent =
        comparePrice && comparePrice > displayPrice
            ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
            : null

    const { addItem, getItemQuantity, isPending } = useCart()
    const { currentAudio, isPlaying, setAudio, setPlaying } = useAudio()

    const isThisAudio = currentAudio?.id === product.audio?.id
    const isThisAudioPlaying = isThisAudio && isPlaying

    // The cart is managed server-side, so "how many can I add" has to account
    // for whatever quantity of this exact variant is already in the cart.
    const quantityInCart = selectedVariant ? getItemQuantity(selectedVariant.sku) : 0
    const availableToAdd = selectedVariant ? Math.max(0, selectedVariant.stock - quantityInCart) : 0
    const isVariantPending = selectedVariant ? isPending(selectedVariant.sku) : false
    const canAddToCart =
        selectedVariant !== null &&
        selectedVariant.is_active &&
        availableToAdd > 0 &&
        !isVariantPending

    // Reset the quantity selector whenever the chosen variant (or its
    // available stock) changes, so a leftover value can't sneak past the
    // new variant's limit.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAddToCartError(null)
        setQuantity(1)
    }, [selectedVariantId, availableToAdd])

    // Capture whether the player was already on *before* this product was
    // opened, so we only auto-start audio for a player that was silent —
    // we never want to hijack a track the user already has going.
    const wasPlayingOnEntry = useRef(isPlaying)

    useEffect(() => {
        if (!product.audio || wasPlayingOnEntry.current) return
        setAudio(product.audio)
        setPlaying(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id])

    const handleToggleAudio = () => {
        if (!product.audio) return
        if (isThisAudioPlaying) {
            setPlaying(false)
            return
        }
        if (!isThisAudio) setAudio(product.audio)
        setPlaying(true)
    }

    const handleAddToCart = async () => {
        if (!selectedVariant || isVariantPending) return

        const quantityToAdd = Math.min(quantity, availableToAdd)
        if (quantityToAdd <= 0) {
            setAddToCartError("موجودی این سایز کافی نیست")
            return
        }

        setAddToCartError(null)
        try {
            await addItem(selectedVariant.sku, quantityToAdd)
            setQuantity(1)
        } catch {
            setAddToCartError("افزودن به سبد خرید با خطا مواجه شد، دوباره تلاش کنید")
        }
    }

    return (
        <div
            dir="rtl"
            className="relative flex h-screen w-full flex-col overflow-hidden lg:flex-row"
        >
            <div className="relative order-1 h-[46vh] w-full shrink-0 lg:order-2 lg:h-full lg:flex-1">
                <Gallery images={images} hasStock={productHasStock} onZoom={setZoomedIndex} />

                {product.audio && (
                    <button
                        onClick={handleToggleAudio}
                        aria-label={isThisAudioPlaying ? "توقف موزیک" : "پخش موزیک"}
                        className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-90 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                    >
                        {isThisAudioPlaying && (
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
                        )}
                        {isThisAudioPlaying ? (
                            <Pause className="relative h-4 w-4" />
                        ) : (
                            <Music className="relative h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            <div
                className={cn(
                    "order-2 flex min-h-0 flex-1 flex-col lg:order-1",
                    "border lg:h-full lg:w-105 lg:flex-none lg:justify-center lg:border-l xl:w-115"
                )}
            >
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 lg:mx-0 lg:flex-none lg:px-8 lg:py-10">
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
                            <div className="mb-2.5 flex space-x-2 text-xs font-medium tracking-wide uppercase">
                                <div>سایز</div>
                                <Separator orientation="vertical" />
                                <div>راهنمای سایز</div>
                            </div>

                            <ButtonGroup>
                                {sortedVariants.map((variant) => {
                                    const disabled = !variant.is_active || variant.stock <= 0
                                    const active = variant.id === selectedVariantId
                                    return (
                                        <Button
                                            key={variant.id}
                                            disabled={disabled}
                                            size={"icon"}
                                            variant={"secondary"}
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            className={cn(
                                                "font-inter relative flex items-center justify-center border text-xs font-semibold transition active:scale-[0.96]",
                                                active
                                                    ? "bg-primary text-background hover:bg-primary dark:text-background"
                                                    : "bg-background text-foreground hover:bg-background",
                                                disabled &&
                                                    "cursor-not-allowed border-border/60 bg-muted/60 text-muted-foreground line-through opacity-60"
                                            )}
                                        >
                                            {variant.size_name}
                                        </Button>
                                    )
                                })}
                            </ButtonGroup>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border bg-background">
                            <Button
                                variant={"ghost"}
                                disabled={quantity <= 1}
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="ghost flex w-9 items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                                aria-label="کاهش تعداد"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="font-inter w-5 text-center text-[12px] font-bold text-foreground tabular-nums">
                                {quantity}
                            </span>
                            <Button
                                variant={"ghost"}
                                disabled={quantity >= availableToAdd}
                                onClick={() => setQuantity((q) => Math.min(availableToAdd, q + 1))}
                                className="ghost flex w-9 items-center justify-center text-muted-foreground active:scale-90 disabled:opacity-40"
                                aria-label="افزایش تعداد"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <Button
                            disabled={!canAddToCart}
                            onClick={handleAddToCart}
                            className={cn(
                                "flex flex-1 items-center justify-center border px-4 font-bold transition active:scale-[0.98]",
                                canAddToCart
                                    ? ""
                                    : "cursor-not-allowed bg-muted text-muted-foreground"
                            )}
                        >
                            {isVariantPending ? (
                                "در حال افزودن..."
                            ) : canAddToCart ? (
                                "افزودن به سبد خرید"
                            ) : (
                                <>
                                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                                    {selectedVariant &&
                                    quantityInCart > 0 &&
                                    selectedVariant.stock > 0
                                        ? "همه‌ی موجودی در سبد شماست"
                                        : "ناموجود"}
                                </>
                            )}
                        </Button>
                    </div>

                    {addToCartError && (
                        <p className="text-[11px] font-medium text-destructive">{addToCartError}</p>
                    )}

                    {product.description && (
                        <div className="border-t pt-4">
                            <p className="text-[12.5px] leading-6 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Lightbox
                images={images}
                index={zoomedIndex}
                onClose={() => setZoomedIndex(null)}
                onNavigate={setZoomedIndex}
            />
        </div>
    )
}

function getTileSpan(count: number, i: number) {
    if (count === 3 && i === 0) return "col-span-1 row-span-2"
    if (count >= 5 && i === 0) return "col-span-2 row-span-2"
    return "col-span-1 row-span-1"
}

function Gallery({
    images,
    hasStock,
    onZoom,
}: {
    images: ProductDetail["images"]
    hasStock: boolean
    onZoom: (index: number) => void
}) {
    const count = images.length
    const visibleCount = Math.min(count, 5)
    const remaining = count - visibleCount

    return (
        <div className="absolute inset-0 overflow-hidden bg-border">
            <div
                className={cn(
                    "grid h-full w-full gap-px",
                    count === 1 && "grid-cols-1 grid-rows-1",
                    count === 2 && "grid-cols-2 grid-rows-1",
                    (count === 3 || count === 4) && "grid-cols-2 grid-rows-2",
                    count >= 5 && "grid-cols-4 grid-rows-2"
                )}
            >
                {images.slice(0, visibleCount).map((img, i) => {
                    const isLastVisible = i === visibleCount - 1
                    return (
                        <motion.button
                            key={img.id}
                            onClick={() => onZoom(i)}
                            aria-label={
                                isLastVisible && remaining > 0
                                    ? `نمایش همه‌ی ${count} تصویر`
                                    : "نمایش تصویر در سایز کامل"
                            }
                            initial={false}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                                "group relative overflow-hidden bg-muted",
                                getTileSpan(count, i)
                            )}
                        >
                            {img.image && (
                                <Image
                                    src={img.image}
                                    alt={img.alt_text || `تصویر محصول ${i + 1}`}
                                    fill
                                    sizes={
                                        count === 1
                                            ? "(min-width: 1024px) 60vw, 100vw"
                                            : "(min-width: 1024px) 30vw, 50vw"
                                    }
                                    quality={95}
                                    priority={i === 0}
                                    draggable={false}
                                    className={cn(
                                        "object-cover transition-transform duration-500 ease-out select-none",
                                        !hasStock && "blur-sm brightness-75 grayscale"
                                    )}
                                />
                            )}

                            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

                            <div className="absolute bottom-2.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                                <ZoomIn className="h-4 w-4" />
                            </div>

                            {isLastVisible && remaining > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/75 via-black/50 to-black/30 text-lg font-bold text-white backdrop-blur-[1px]">
                                    +{remaining}
                                </div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/55 via-black/20 to-transparent lg:hidden" />

            {!hasStock && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
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
        </div>
    )
}

function Lightbox({
    images,
    index,
    onClose,
    onNavigate,
}: {
    images: ProductDetail["images"]
    index: number | null
    onClose: () => void
    onNavigate: (index: number) => void
}) {
    const [direction, setDirection] = useState(0)
    const isOpen = index !== null
    const hasMultiple = images.length > 1
    const current = isOpen ? images[index] : null

    const goTo = (i: number, dir: number) => {
        if (index === null) return
        const next = ((i % images.length) + images.length) % images.length
        setDirection(dir)
        onNavigate(next)
    }

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    const SWIPE_OFFSET_THRESHOLD = 42
    const SWIPE_VELOCITY_THRESHOLD = 380

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (!hasMultiple || index === null) return
        const { offset, velocity } = info
        if (offset.x < -SWIPE_OFFSET_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
            goTo(index + 1, 1)
        } else if (offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
            goTo(index - 1, -1)
        }
    }

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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <button
                        onClick={onClose}
                        aria-label="بستن"
                        className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-70 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative h-[85vh] w-[92vw] max-w-3xl overflow-hidden"
                    >
                        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                            <motion.div
                                key={current?.id ?? index}
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
                                        alt={current.alt_text || "نمایش کامل تصویر محصول"}
                                        fill
                                        sizes="92vw"
                                        quality={95}
                                        draggable={false}
                                        className="object-contain select-none"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {hasMultiple && index !== null && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        goTo(index - 1, -1)
                                    }}
                                    aria-label="تصویر قبلی"
                                    className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-70 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        goTo(index + 1, 1)
                                    }}
                                    aria-label="تصویر بعدی"
                                    className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground opacity-70 backdrop-blur-md transition hover:opacity-100 active:scale-90"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                                    {images.map((img, i) => (
                                        <button
                                            key={img.id}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                goTo(i, i > index ? 1 : -1)
                                            }}
                                            aria-label={`تصویر ${i + 1}`}
                                            className={cn(
                                                "h-1 rounded-full transition-all duration-200",
                                                i === index
                                                    ? "w-6 bg-primary"
                                                    : "w-1.5 bg-background/70"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
