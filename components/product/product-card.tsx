"use client"

import Image from "next/image"
import Link from "next/link"
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

export function ProductCard({
    product,
    isWishlisted = false,
    onToggleWishlist,
    onAddToCart,
}: {
    product: ProductListItem
    isWishlisted?: boolean
    onToggleWishlist?: (product: ProductListItem) => void
    onAddToCart?: (product: ProductListItem, variant: ProductVariant) => void
}) {
    const image = getPrimaryImage(product.images)
    const variant = getDisplayVariant(product.variants)
    const outOfStock = !variant || variant.stock === 0
    const showsFrom = hasRangeOfPrices(product.variants)

    const discountPercent =
        variant?.compare_price && variant.compare_price > variant.price
            ? Math.round(100 - (variant.price / variant.compare_price) * 100)
            : null

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background transition-all hover:border-foreground/30 hover:shadow-md"
        >
            <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-accent">
                {image ? (
                    <Image
                        src={image.image}
                        alt={image.alt_text || product.title}
                        fill
                        sizes="(min-width: 1024px) 22vw, 45vw"
                        className={cn(
                            "object-cover transition-transform duration-300 group-hover:scale-105",
                            outOfStock && "opacity-60 grayscale"
                        )}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="size-8 text-muted-foreground" />
                    </div>
                )}

                {/* start = right edge in this RTL layout, end = left edge */}
                <div className="absolute inset-s-2.5 top-2.5 flex flex-col items-start gap-1.5">
                    {product.featured && (
                        <Badge className="border-transparent bg-foreground text-background">
                            ویژه
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
                        className="absolute inset-e-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
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
                <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {product.short_description}
                </p>

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
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-2 h-5 w-1/2" />
            </div>
        </div>
    )
}
