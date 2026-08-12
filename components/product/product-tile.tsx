import Image from "next/image"
import Link from "next/link"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Identical to the ProductTile defined locally in mobile-home.tsx — moved
// here so the blog page can reuse it verbatim for related products instead
// of inventing a second, slightly-different card. mobile-home.tsx can drop
// its local copy and import this one next time it's touched.
// ---------------------------------------------------------------------------
export function ProductTile({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <Link
            href={`p/${item.slug}`}
            className="block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
        >
            <div className="relative aspect-3/4 w-full bg-muted">
                <Image
                    src={item.images[0]?.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 45vw, 180px"
                    draggable={false}
                    className={cn(
                        "object-cover select-none",
                        !hasStock && "brightness-90 grayscale-[0.5]"
                    )}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />

                {!hasStock && (
                    <span className="absolute top-2 right-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1 p-2.5">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                    {item.variants?.[0] ? (
                        <>
                            <span className="font-semibold text-foreground">
                                {formatPrice(item.variants[0].price)}
                            </span>{" "}
                            تومان
                        </>
                    ) : (
                        <span className="invisible">—</span>
                    )}
                </p>
            </div>
        </Link>
    )
}
