import Image from "next/image"
import Link from "next/link"
import { Reveal } from "@/components/layout/scroll-reveal"
import type { CollectionListItem } from "@/types/collection"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Collections index — one responsive component for both breakpoints rather
// than a mobile/desktop split. Unlike the products page, a collection
// listing doesn't have that same swipe-vs-grid tension (no velocity
// marquee to translate) — a grid is the right shape at every width, so a
// single component just reflows.
//
//   Mobile (default): 2 columns, uniform aspect-4/5 tiles.
//   sm:                3 columns.
//   lg+:                4 columns, and the FIRST collection becomes a 2x2
//                       "hero" tile — the one deliberate bigger moment on
//                       an otherwise quiet grid, for whichever collection
//                       the brand wants to lead with. Only kicks in at 5+
//                       items, since a hero tile with just three others
//                       around it reads as an accident, not a choice.
//
// Plain server component, same pattern as mobile-home.tsx / mobile-products
// — no client JS beyond <Reveal> (IntersectionObserver only).
//
// NOTE ON IMPORTS: Reveal is assumed to live at
// @/components/layout/scroll-reveal, same as in mobile-products.tsx.
// Adjust if your actual file layout differs.
//
// NOTE ON DATA: assumes CollectionListItem carries slug, title, image,
// image_dark, and an optional short_description (mirrors the fields
// mobile-home.tsx's own CollectionsSection already reads off this type,
// plus short_description from the sibling ProductCollection shape in
// product.ts). Adjust field names if the real type differs.
// ---------------------------------------------------------------------------

interface CollectionsGridProps {
    items: CollectionListItem[]
    className?: string
}

export default function CollectionsGrid({ items, className = "" }: CollectionsGridProps) {
    if (items.length === 0) {
        return <EmptyState className={className} />
    }

    const useHero = items.length >= 5

    return (
        <div className={cn("mx-auto max-w-6xl px-5 pt-6 pb-16 lg:px-10 lg:pt-14", className)}>
            <PageIntro count={items.length} />

            <ul
                role="list"
                className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12 lg:grid-cols-4 lg:gap-5"
            >
                {items.map((collection, idx) => {
                    const isHero = useHero && idx === 0
                    return (
                        <li
                            key={collection.slug}
                            className={isHero ? "col-span-2 row-span-2" : undefined}
                        >
                            <Reveal delay={Math.min(idx, 8) * 50}>
                                <CollectionCard
                                    collection={collection}
                                    hero={isHero}
                                    eager={idx < 4}
                                />
                            </Reveal>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Intro — eyebrow + title + live count, same voice as the products page
// intro so the two listing pages read as siblings. Title scales up on
// desktop since there's no separate hero section on this page to carry
// that weight instead.
// ---------------------------------------------------------------------------
function PageIntro({ count }: { count: number }) {
    return (
        <Reveal>
            <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                دنیای استاربوی
            </p>
            <div className="mt-1.5 flex items-end justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-4xl">
                    همه کالکشن‌ها
                </h1>
                <span className="pb-0.5 text-xs text-muted-foreground lg:text-sm">
                    {count} کالکشن
                </span>
            </div>
        </Reveal>
    )
}

function CollectionCard({
    collection,
    hero,
    eager,
}: {
    collection: CollectionListItem
    hero: boolean
    eager: boolean
}) {
    return (
        <Link
            href={`/collections/${collection.slug}`}
            className="group relative block h-full overflow-hidden rounded-2xl bg-muted transition-transform active:scale-[0.98] lg:active:scale-100"
        >
            <div className={cn("relative w-full", hero ? "aspect-square lg:h-full" : "aspect-4/5")}>
                <CollectionImage
                    collection={collection}
                    sizes={
                        hero ? "(min-width: 1024px) 50vw, 90vw" : "(min-width: 1024px) 25vw, 45vw"
                    }
                    eager={eager}
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

                <div
                    className={cn(
                        "absolute inset-x-0 bottom-0 text-neutral-50 transition-transform duration-300 lg:group-hover:-translate-y-1",
                        hero ? "p-5 lg:p-7" : "p-3"
                    )}
                >
                    <p className={cn("font-semibold", hero ? "text-lg lg:text-2xl" : "text-sm")}>
                        {collection.title}
                    </p>
                    {hero && collection.short_description && (
                        <p className="mt-1.5 line-clamp-2 max-w-[38ch] text-xs text-neutral-200 lg:text-sm">
                            {collection.short_description}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}

// ---------------------------------------------------------------------------
// Handles the light/dark image pair the same way mobile-home.tsx's own
// CollectionsSection does, plus a labelled fallback for collections with
// neither image set — a grid tile with a silently blank image reads as
// broken, not empty.
// ---------------------------------------------------------------------------
function CollectionImage({
    collection,
    sizes,
    eager,
}: {
    collection: CollectionListItem
    sizes: string
    eager: boolean
}) {
    if (!collection.image && !collection.image_dark) {
        return (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                بدون تصویر
            </div>
        )
    }

    return (
        <>
            {collection.image && (
                <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    sizes={sizes}
                    className={cn("object-cover", collection.image_dark && "dark:hidden")}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />
            )}
            {collection.image_dark && (
                <Image
                    src={collection.image_dark}
                    alt={collection.title}
                    fill
                    sizes={sizes}
                    className={cn("hidden object-cover", collection.image && "dark:block")}
                    loading={eager ? "eager" : "lazy"}
                />
            )}
        </>
    )
}

// ---------------------------------------------------------------------------
// Empty state — same register as mobile-products.tsx: says what happened,
// not an apology.
// ---------------------------------------------------------------------------
function EmptyState({ className }: { className?: string }) {
    return (
        <div className={cn("mx-auto max-w-6xl px-5 py-24 text-center lg:px-10", className)}>
            <p className="text-sm font-medium text-foreground">فعلاً کالکشنی موجود نیست</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
                به‌زودی کالکشن‌های جدید اینجا نمایش داده می‌شن.
            </p>
        </div>
    )
}
