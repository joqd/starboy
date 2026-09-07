"use client"

import Image from "next/image"
import { Link } from "next-view-transitions"
import { Heart, Package, ShoppingBag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProductListItem, ProductVariant } from "@/types/product"

function formatToman(value: number) {
    return `${value.toLocaleString("fa-IR")} تومان`
}

function getPrimaryImage(images: ProductListItem["images"]) {
    return images.find((image) => image.is_primary) ?? images[0] ?? null
}

/** Cheapest in-stock active variant; falls back to the cheapest variant overall. */
function getDisplayVariant(variants: ProductVariant[]): ProductVariant | null {
    if (variants.length === 0) return null
    const inStock = variants.filter((v) => v.is_active && v.stock > 0)
    const pool = inStock.length > 0 ? inStock : variants
    return pool.reduce((cheapest, variant) => (variant.price < cheapest.price ? variant : cheapest))
}

function hasRangeOfPrices(variants: ProductVariant[]) {
    return new Set(variants.map((v) => v.price)).size > 1
}

/** One entry per distinct size — available if any variant in that size is in stock. */
function getSizeOptions(variants: ProductVariant[]) {
    const bySize = new Map<string, { label: string; available: boolean }>()

    for (const variant of variants) {
        const key = variant.size_name
        const available = variant.is_active && variant.stock > 0
        const existing = bySize.get(key)
        if (!existing || (!existing.available && available)) {
            bySize.set(key, { label: variant.size?.label || variant.size_name, available })
        }
    }

    return Array.from(bySize.values())
}

export function ProductCard({
    product,
    isWishlisted = false,
    eager = false,
    sizes = "(min-width: 1024px) 22vw, 45vw",
    badgeLabel,
    onToggleWishlist,
    onAddToCart,
}: {
    product: ProductListItem
    isWishlisted?: boolean
    /** Set for above-the-fold tiles (e.g. the first row) to skip lazy-loading. */
    eager?: boolean
    /** Override the `sizes` attribute for the tile's actual layout width. */
    sizes?: string
    /** Manual badge text (e.g. "پرفروش") shown instead of the default "ویژه" tag. */
    badgeLabel?: string
    onToggleWishlist?: (product: ProductListItem) => void
    onAddToCart?: (product: ProductListItem, variant: ProductVariant) => void
}) {
    const image = getPrimaryImage(product.images)
    const variant = getDisplayVariant(product.variants)
    const outOfStock = !variant || variant.stock === 0
    const showsFrom = hasRangeOfPrices(product.variants)
    const sizeOptions = getSizeOptions(product.variants)

    const discountPercent =
        variant?.compare_price && variant.compare_price > variant.price
            ? Math.round(100 - (variant.price / variant.compare_price) * 100)
            : null

    return (
        <Link
            href={`/p/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background transition-colors hover:border-foreground/30"
        >
            <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-accent">
                {image ? (
                    <Image
                        src={image.image}
                        alt={image.alt_text || product.title}
                        fill
                        sizes={sizes}
                        draggable={false}
                        className={cn(
                            "object-cover transition-transform duration-300 select-none group-hover:scale-105",
                            outOfStock && "opacity-60 grayscale"
                        )}
                        loading={eager ? "eager" : "lazy"}
                        fetchPriority={eager ? "high" : "auto"}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="size-8 text-muted-foreground" />
                    </div>
                )}

                {/* start = right edge in this RTL layout, end = left edge */}
                <div className="absolute start-2.5 top-2.5 flex flex-col items-start gap-1.5">
                    {(badgeLabel || product.featured) && (
                        <Badge className="border-transparent bg-foreground text-background">
                            {badgeLabel ?? "ویژه"}
                        </Badge>
                    )}
                    {discountPercent !== null && !outOfStock && (
                        <Badge className="text-destructive-foreground border-transparent bg-destructive">
                            {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                        </Badge>
                    )}
                </div>

                {onToggleWishlist && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleWishlist(product)
                        }}
                        className="absolute end-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
                        aria-label="افزودن به علاقه‌مندی‌ها"
                    >
                        <Heart
                            className={cn(
                                "size-4",
                                isWishlisted && "fill-destructive text-destructive"
                            )}
                        />
                    </button>
                )}

                {outOfStock && (
                    <div className="absolute inset-x-0 bottom-0 bg-foreground/85 py-1.5 text-center text-xs font-medium text-background">
                        ناموجود
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-3.5">
                <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                    {product.title}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                    {sizeOptions.length > 0 ? (
                        sizeOptions.map((size) => (
                            <span
                                key={size.label}
                                className={cn(
                                    "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                                    size.available
                                        ? "border-border/60 text-foreground"
                                        : "border-border/40 text-muted-foreground line-through"
                                )}
                            >
                                {size.label}
                            </span>
                        ))
                    ) : (
                        // No variants at all — an invisible placeholder chip
                        // keeps this row's height so every card in the grid
                        // lines up the same, sized or not.
                        <span
                            aria-hidden
                            className="invisible rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
                        >
                            —
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    <div className="flex flex-col gap-0.5">
                        {variant?.compare_price && variant.compare_price > variant.price && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatToman(variant.compare_price)}
                            </span>
                        )}
                        <span className="text-sm font-bold text-foreground">
                            {showsFrom && (
                                <span className="text-xs font-normal text-muted-foreground">
                                    از{" "}
                                </span>
                            )}
                            {variant ? formatToman(variant.price) : "ناموجود"}
                        </span>
                    </div>

                    {onAddToCart && (
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            disabled={outOfStock}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (variant) onAddToCart(product, variant)
                            }}
                            className="size-9 shrink-0 rounded-full transition-colors group-hover:bg-foreground group-hover:text-background"
                            aria-label="افزودن به سبد خرید"
                        >
                            <ShoppingBag className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Link>
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60">
            <Skeleton className="aspect-4/5 w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-2 h-5 w-1/2" />
            </div>
        </div>
    )
}
