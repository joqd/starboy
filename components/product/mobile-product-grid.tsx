import Image from "next/image"
import Link from "next/link"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mobile product grid — replaces the slider entirely rather than trying to
// make a one-item-at-a-time layout feel less empty. A 2-column grid shows
// several products at once, uses the width of the screen instead of just
// its center, and reads as a normal scrollable page instead of a locked
// h-screen viewport with one product visible at a time.
//
// Fully static: no "use client", no JS shipped for this component at all —
// not even the native-scroll-snap machinery the slider version used. Cards
// are plain flow layout; the page scrolls the ordinary way.
//
// Styled to match shadcn/ui's card conventions (bg-card/text-card-foreground/
// border, muted-foreground for secondary text, a pill badge for stock
// status) using the semantic color tokens shadcn projects define in
// globals.css — this works whether or not @/components/ui/card is actually
// installed, since it only depends on the CSS variables, not the component.
// If this project does have shadcn/ui's Card and Badge primitives, swapping
// this markup for those is a straightforward follow-up and won't change
// anything visually.
// ---------------------------------------------------------------------------

interface MobileProductGridProps {
    items: ProductListItem[]
    className?: string
}

// First row (2 cards) loads eager + high priority since it's on screen
// immediately; everything below uses native lazy-loading so it only fetches
// as the user scrolls to it.
const EAGER_COUNT = 2

export default function MobileProductGrid({ items, className = "" }: MobileProductGridProps) {
    if (items.length === 0) return null

    return (
        <section className={cn("px-4 pt-8 pb-16", className)}>
            <header className="mb-5 flex items-baseline justify-between">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    جدیدترین محصولات
                </h1>
                <span className="text-sm text-muted-foreground">{items.length} محصول</span>
            </header>

            <ul role="list" className="grid grid-cols-2 gap-3">
                {items.map((item, idx) => (
                    <ProductCard key={item.slug} item={item} eager={idx < EAGER_COUNT} />
                ))}
            </ul>
        </section>
    )
}

function ProductCard({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <li className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <Link href={`p/${item.slug}`} className="block">
                <div className="relative aspect-[3/4] w-full bg-muted">
                    <Image
                        src={item.images[0]?.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
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
                    {item.variants?.[0] && (
                        <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {formatPrice(item.variants[0].price)}
                            </span>{" "}
                            تومان
                        </p>
                    )}
                </div>
            </Link>
        </li>
    )
}
