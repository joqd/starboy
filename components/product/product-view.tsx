"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "next-view-transitions"
import Image from "next/image"
import { motion, AnimatePresence, type PanInfo } from "motion/react"
import {
    ArrowRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Lock,
    Minus,
    Music,
    Plus,
    RotateCcw,
    ShieldCheck,
    Truck,
    X,
    ZoomIn,
} from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { ProductDetail } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ButtonGroup } from "@/components/ui/button-group"
import { useCart } from "@/hooks/use-cart"
import { useAudio } from "@/hooks/use-audio"
import SizeGuide from "./size-guide"

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

    const sortedVariants = [...product.variants].sort()

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        sortedVariants.find((v) => v.is_active && v.stock > 0)?.id ?? null
    )
    const [quantity, setQuantity] = useState(1)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
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

    const router = useRouter()

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

    const primaryCollection = product.collections[0]

    return (
        <div
            dir="rtl"
            className="relative mx-auto max-w-295 px-4 pt-20 pb-16 sm:px-6 lg:px-10 lg:pt-10 lg:pb-24 xl:px-10"
        >
            {/* Breadcrumb ---------------------------------------------------- */}
            {/* <div className="mb-6 flex items-center justify-between gap-4 lg:mb-8">
                <nav className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
                        خانه
                    </Link>
                    <ChevronLeft className="h-3 w-3 shrink-0" />
                    <Link href="/p" className="shrink-0 transition-colors hover:text-foreground">
                        فروشگاه
                    </Link>
                    {primaryCollection && (
                        <>
                            <ChevronLeft className="h-3 w-3 shrink-0" />
                            <span className="hidden shrink-0 sm:inline">
                                {primaryCollection.title}
                            </span>
                        </>
                    )}
                    <ChevronLeft className="h-3 w-3 shrink-0" />
                    <span className="truncate text-foreground">{product.title}</span>
                </nav>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowRight className="h-3 w-3" />
                    بازگشت
                </button>
            </div> */}

            {/* Gallery + buy box ---------------------------------------------- */}
            <div
                className={cn(
                    "grid gap-6 lg:items-start lg:gap-8 xl:gap-10",
                    images.length > 1 ? "lg:grid-cols-[64px_1fr_400px]" : "lg:grid-cols-[1fr_400px]"
                )}
            >
                {/* Thumbnail rail — desktop only */}
                {images.length > 1 && (
                    <div className="hidden lg:sticky lg:top-24 lg:flex lg:max-h-[72vh] lg:flex-col lg:gap-2 lg:overflow-y-auto">
                        {images.map((img, i) => (
                            <Thumbnail
                                key={img.id}
                                img={img}
                                index={i}
                                active={i === activeImageIndex}
                                hasStock={productHasStock}
                                onSelect={() => setActiveImageIndex(i)}
                                className="h-16 w-16"
                            />
                        ))}
                    </div>
                )}

                {/* Main image */}
                <div className="lg:sticky lg:top-24">
                    <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted">
                        <button
                            onClick={() => setZoomedIndex(activeImageIndex)}
                            aria-label="نمایش تصویر در سایز کامل"
                            className="group absolute inset-0 h-full w-full"
                        >
                            <MainImage
                                image={images[activeImageIndex] ?? images[0]}
                                hasStock={productHasStock}
                            />
                            <div className="absolute bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                                <ZoomIn className="h-4 w-4" />
                            </div>
                        </button>

                        {product.audio && (
                            <button
                                onClick={handleToggleAudio}
                                aria-label={isThisAudioPlaying ? "توقف موزیک" : "پخش موزیک"}
                                title={isThisAudioPlaying ? "توقف موزیک محصول" : "پخش موزیک محصول"}
                                className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground backdrop-blur-md transition hover:text-primary active:scale-90"
                            >
                                {isThisAudioPlaying ? (
                                    <span className="flex h-3 items-end gap-[2px]">
                                        <motion.span
                                            className="w-[2px] rounded-full bg-primary"
                                            animate={{ height: ["35%", "100%", "35%"] }}
                                            transition={{
                                                duration: 0.9,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        />
                                        <motion.span
                                            className="w-[2px] rounded-full bg-primary"
                                            animate={{ height: ["100%", "45%", "100%"] }}
                                            transition={{
                                                duration: 0.9,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.15,
                                            }}
                                        />
                                        <motion.span
                                            className="w-[2px] rounded-full bg-primary"
                                            animate={{ height: ["55%", "90%", "55%"] }}
                                            transition={{
                                                duration: 0.9,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.3,
                                            }}
                                        />
                                    </span>
                                ) : (
                                    <Music className="h-3.5 w-3.5" />
                                )}
                            </button>
                        )}

                        {!productHasStock && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                                <div
                                    className="flex flex-col items-center gap-1.5 text-white"
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

                    {/* Thumbnails — mobile only */}
                    {images.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
                            {images.map((img, i) => (
                                <Thumbnail
                                    key={img.id}
                                    img={img}
                                    index={i}
                                    active={i === activeImageIndex}
                                    hasStock={productHasStock}
                                    onSelect={() => setActiveImageIndex(i)}
                                    className="h-16 w-14 shrink-0"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Buy box */}
                <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                    <div>
                        {primaryCollection && (
                            <span className="mb-2 inline-block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                {primaryCollection.title}
                            </span>
                        )}
                        <h1 className="text-[26px] leading-[1.1] font-bold tracking-tight text-primary uppercase lg:text-[30px]">
                            {product.title}
                        </h1>
                        {product.short_description && (
                            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                                {product.short_description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl font-bold">
                            {formatPrice(displayPrice)} تومان
                        </span>
                        {comparePrice && comparePrice > displayPrice && (
                            <>
                                <span className="text-[12px] text-muted-foreground line-through">
                                    {formatPrice(comparePrice)}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    {discountPercent}٪-
                                </span>
                            </>
                        )}
                    </div>

                    <Separator />

                    {sortedVariants.length > 0 && (
                        <div>
                            <div className="mb-2.5 flex space-x-2 text-xs font-medium tracking-wide uppercase">
                                <div>سایز</div>
                                <Separator orientation="vertical" />
                                <SizeGuide variants={sortedVariants} />
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
                                            {variant.size.label}
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
                            <span className="w-5 text-center text-[12px] font-bold text-foreground tabular-nums">
                                {formatPrice(quantity)}
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
                        <p className="-mt-3 text-[11px] font-medium text-destructive">
                            {addToCartError}
                        </p>
                    )}

                    {/* Trust row */}
                    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/25 p-4">
                        <Link
                            href="/shipping-returns"
                            className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Truck
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                strokeWidth={1.8}
                            />
                            ارسال سریع به سراسر کشور
                        </Link>
                        <Link
                            href="/shipping-returns"
                            className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <RotateCcw
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                strokeWidth={1.8}
                            />
                            ۷ روز مهلت مرجوعی و تعویض
                        </Link>
                        <div className="flex items-center gap-2.5 text-[11.5px] text-muted-foreground">
                            <ShieldCheck
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                strokeWidth={1.8}
                            />
                            پرداخت امن و تضمین اصالت کالا
                        </div>
                    </div>
                </div>
            </div>

            {/* Details accordion ----------------------------------------------- */}
            <div className="mx-auto mt-16 max-w-2xl lg:mt-24">
                {product.description && (
                    <AccordionSection title="توضیحات محصول" defaultOpen>
                        <p className="text-[12.5px] leading-7 whitespace-pre-line text-foreground">
                            {product.description}
                        </p>
                    </AccordionSection>
                )}
                <AccordionSection title="ارسال و مرجوعی">
                    <p className="text-[12.5px] leading-7 text-muted-foreground">
                        سفارش شما در کمتر از ۲۴ ساعت آماده و ارسال می‌شه و تا ۷ روز بعد از تحویل،
                        امکان مرجوعی یا تعویض داری.{" "}
                        <Link
                            href="/shipping-returns"
                            className="text-foreground underline underline-offset-2"
                        >
                            جزئیات کامل رو اینجا بخون
                        </Link>
                        .
                    </p>
                </AccordionSection>
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

// ---------------------------------------------------------------------------
function AccordionSection({
    title,
    defaultOpen = false,
    children,
}: {
    title: string
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="border-b border-border/60">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 py-4 text-right text-[13px] font-bold text-foreground"
            >
                {title}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                        open && "rotate-180"
                    )}
                />
            </button>
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="pb-5">{children}</div>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
function MainImage({
    image,
    hasStock,
}: {
    image: ProductDetail["images"][number]
    hasStock: boolean
}) {
    const [loaded, setLoaded] = useState(false)

    // A new active image starts its own loading cycle.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoaded(false)
    }, [image?.id])

    return (
        <>
            {!loaded && (
                <div className="absolute inset-0 overflow-hidden bg-muted">
                    <motion.div
                        className="absolute inset-y-0 w-1/2 bg-linear-to-l from-transparent via-foreground/10 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            )}

            {image?.image && (
                <Image
                    src={image.image}
                    alt={image.alt_text || "تصویر محصول"}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={95}
                    priority
                    draggable={false}
                    onLoad={() => setLoaded(true)}
                    className={cn(
                        "object-cover transition-all duration-500 ease-out select-none",
                        !hasStock && "blur-sm brightness-75 grayscale",
                        loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
                    )}
                />
            )}
        </>
    )
}

function Thumbnail({
    img,
    index,
    active,
    hasStock,
    onSelect,
    className,
}: {
    img: ProductDetail["images"][number]
    index: number
    active: boolean
    hasStock: boolean
    onSelect: () => void
    className?: string
}) {
    const [loaded, setLoaded] = useState(false)

    return (
        <button
            onClick={onSelect}
            aria-label={`نمایش تصویر ${index + 1}`}
            aria-current={active}
            className={cn(
                "relative shrink-0 overflow-hidden rounded-lg border bg-muted transition",
                active ? "border-primary" : "border-border/60 opacity-70 hover:opacity-100",
                className
            )}
        >
            {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}

            {img.image && (
                <Image
                    src={img.image}
                    alt={img.alt_text || `تصویر محصول ${index + 1}`}
                    fill
                    sizes="64px"
                    quality={90}
                    draggable={false}
                    onLoad={() => setLoaded(true)}
                    className={cn(
                        "object-cover transition-opacity duration-500 select-none",
                        !hasStock && "grayscale",
                        loaded ? "opacity-100" : "opacity-0"
                    )}
                />
            )}
        </button>
    )
}

// ---------------------------------------------------------------------------
// Lightbox — unchanged from before.
// ---------------------------------------------------------------------------
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
