import Image from "next/image"
import Link from "next/link"
import { HeroImage } from "@/components/layout/hero-image"
import { Reveal } from "@/components/layout/scroll-reveal"
import type { ProductListItem } from "@/types/product"
import type { CollectionListItem } from "@/types/collection"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mobile products page — companion to the desktop <ScrollVelocityGallery>,
// which page.tsx already renders only at lg:block. Same intent translated
// into a mobile grammar rather than a shrink of the desktop layout:
//
//   intro  ->  collection chips  ->  swipe gallery  ->  brand banner  ->  grid
//
// The swipe gallery stands in for the desktop velocity marquee (touch
// drag is the mobile equivalent of that horizontal motion). The brand
// HeroImage moves from an absolutely-positioned corner element (desktop)
// to a full-width banner, since mobile has no spare corner to anchor it
// to. The grid at the bottom is the one deliberate addition beyond what
// desktop shows here — swipe-only browsing works for a taste of the
// catalogue but not for actually shopping it on a phone.
//
// Plain server component, same as mobile-home.tsx — no client JS beyond
// <Reveal> (IntersectionObserver only).
//
// NOTE ON IMPORTS: Reveal is assumed to live at the same path mobile-home.tsx
// resolves "./scroll-reveal" to (@/components/layout/scroll-reveal here).
// Adjust if your actual file layout differs.
// ---------------------------------------------------------------------------

interface MobileProductsProps {
    products: ProductListItem[]
    featured?: ProductListItem[]
    collections?: CollectionListItem[]
    className?: string
}

export default function MobileProducts({
    products,
    featured = [],
    collections = [],
    className = "",
}: MobileProductsProps) {
    if (products.length === 0) {
        return <EmptyState className={className} />
    }

    return (
        <div className={cn("overflow-x-hidden pb-16", className)}>
            <PageIntro count={products.length} />
            {collections.length > 0 && <CollectionsChips items={collections} />}
            <GallerySection items={featured.length > 0 ? featured : products} />
            <HeroBanner />
            <CatalogueGrid items={products} />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Intro — just an eyebrow, the page title, and a live count. No hero-sized
// headline here; that weight belongs to the gallery just below it.
// ---------------------------------------------------------------------------
function PageIntro({ count }: { count: number }) {
    return (
        <section className="mt-15 px-5 pt-6">
            <Reveal>
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    فروشگاه
                </p>
                <div className="mt-1.5 flex items-end justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        همه محصولات
                    </h1>
                    <span className="pb-0.5 text-xs text-muted-foreground">{count} محصول</span>
                </div>
            </Reveal>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Collection chips — a quick horizontal nav so a phone user isn't stuck
// scrolling the entire catalogue to narrow it down. Snap-scroll like every
// other strip on mobile, capped at eight so it never turns into a second
// grid to browse.
// ---------------------------------------------------------------------------
function CollectionsChips({ items }: { items: CollectionListItem[] }) {
    const shown = items.slice(0, 8)

    return (
        <nav
            aria-label="فیلتر بر اساس کالکشن"
            className={cn(
                "mt-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1",
                "scroll-px-5 overscroll-x-contain",
                "scrollbar-none [&::-webkit-scrollbar]:hidden"
            )}
        >
            {shown.map((collection) => (
                <Link
                    key={collection.slug}
                    href={`/collections/${collection.slug}`}
                    className="shrink-0 snap-start rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground"
                >
                    {collection.title}
                </Link>
            ))}
        </nav>
    )
}

// ---------------------------------------------------------------------------
// Gallery — the mobile stand-in for the desktop velocity marquee. Large
// swipeable cards, price and title overlaid on the image itself so the
// strip reads as a showcase rather than a shop grid (that's the section
// below it). Falls back to latest products if no featured set is passed.
// ---------------------------------------------------------------------------
function GallerySection({ items }: { items: ProductListItem[] }) {
    const shown = items.slice(0, 6)

    return (
        <section className="mt-8">
            <ul
                role="list"
                className={cn(
                    "flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2",
                    "scroll-px-5 overscroll-x-contain",
                    "scrollbar-none [&::-webkit-scrollbar]:hidden"
                )}
            >
                {shown.map((item, idx) => (
                    <li key={item.slug} className="w-[68vw] max-w-64 shrink-0 snap-start">
                        <Reveal delay={idx * 60}>
                            <GalleryCard item={item} eager={idx < 2} />
                        </Reveal>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function GalleryCard({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const variant = item.variants?.[0]
    const hasStock = item.variants?.some((v) => v.stock > 0)
    const onSale = Boolean(variant?.compare_price && variant.compare_price > variant.price)

    return (
        <Link href={`/p/${item.slug}`} className="block">
            <div className="relative aspect-3/4 overflow-hidden rounded-[1.5rem] bg-muted">
                <Image
                    src={item.images[0]?.image}
                    alt={item.title}
                    fill
                    sizes="70vw"
                    draggable={false}
                    className={cn(
                        "object-cover select-none",
                        !hasStock && "brightness-90 grayscale-[0.5]"
                    )}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                {item.featured && (
                    <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-neutral-900">
                        ویژه
                    </span>
                )}
                {!hasStock && (
                    <span className="absolute top-3 left-3 rounded-full border border-white/40 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                        ناموجود
                    </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 text-neutral-50">
                    <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                    {variant && (
                        <p className="mt-1 text-xs">
                            {onSale && (
                                <span className="ml-1.5 text-neutral-400 line-through">
                                    {formatPrice(variant.compare_price as number)}
                                </span>
                            )}
                            <span className="font-semibold text-neutral-50">
                                {formatPrice(variant.price)}
                            </span>{" "}
                            <span className="text-neutral-300">تومان</span>
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

// ---------------------------------------------------------------------------
// Brand banner — the mobile placement of the same <HeroImage> the desktop
// version anchors to the bottom-left corner. Full width here since mobile
// has no spare corner; a contained rounded panel instead of full-bleed,
// consistent with how mobile-home.tsx treats its own hero.
// ---------------------------------------------------------------------------
function HeroBanner() {
    return (
        <section className="relative mx-5 mt-10 aspect-16/10 overflow-hidden rounded-[1.75rem]">
            <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                <HeroImage />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-neutral-50">
                <p className="text-xs tracking-[0.25em] uppercase opacity-80">کالکشن جدید</p>
                <h2 className="mt-2 text-xl leading-tight font-bold">استایل خودت رو بساز</h2>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Catalogue grid — the full product list, two columns. This is the part
// desktop doesn't need (its gallery + full catalogue interaction lives at
// large widths where scroll-velocity browsing works on its own); on
// mobile the grid is what actually lets someone shop, not just look.
// ---------------------------------------------------------------------------
function CatalogueGrid({ items }: { items: ProductListItem[] }) {
    return (
        <section className="mt-10">
            <div className="mb-4 px-5">
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    کاتالوگ کامل
                </p>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">
                    مشاهده همه محصولات
                </h2>
            </div>
            <ul role="list" className="grid grid-cols-2 gap-3 px-5">
                {items.map((item, idx) => (
                    <li key={item.slug}>
                        <Reveal delay={(idx % 4) * 50}>
                            <ProductTile item={item} eager={idx < 2} />
                        </Reveal>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function ProductTile({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const variant = item.variants?.[0]
    const hasStock = item.variants?.some((v) => v.stock > 0)
    const onSale = Boolean(variant?.compare_price && variant.compare_price > variant.price)
    const discountPct = onSale
        ? Math.round(
              (((variant!.compare_price as number) - variant!.price) /
                  (variant!.compare_price as number)) *
                  100
          )
        : null

    return (
        <Link
            href={`/p/${item.slug}`}
            className="block overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-transform active:scale-[0.98]"
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

                {discountPct !== null && (
                    <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        ٪{discountPct}-
                    </span>
                )}

                {!hasStock && (
                    <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1 p-2.5">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                    {variant ? (
                        <>
                            {onSale && (
                                <span className="ml-1 text-muted-foreground/70 line-through">
                                    {formatPrice(variant.compare_price as number)}
                                </span>
                            )}
                            <span className="font-semibold text-foreground">
                                {formatPrice(variant.price)}
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

// ---------------------------------------------------------------------------
// Empty state — the interface's own voice, not an apology. Names what
// happened and leaves nothing to guess at.
// ---------------------------------------------------------------------------
function EmptyState({ className }: { className?: string }) {
    return (
        <div className={cn("px-5 py-24 text-center", className)}>
            <p className="text-sm font-medium text-foreground">فعلاً محصولی موجود نیست</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
                به‌زودی محصولات جدید اینجا نمایش داده می‌شن.
            </p>
        </div>
    )
}
