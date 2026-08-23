"use client"

import Image from "next/image"
import Link from "next/link"
import { HeroImage } from "@/components/layout/hero-image"
import { Reveal } from "@/components/layout/scroll-reveal"
import type { ProductListItem } from "@/types/product"
import type { CollectionListItem } from "@/types/collection"
import { cn, formatPrice } from "@/lib/utils"
import { useProductFilters, type ProductFiltersState } from "@/hooks/use-product-filters"

// ---------------------------------------------------------------------------
// Products explorer — one responsive component covering both mobile and
// desktop (replaces the old mobile-only split). Same visual grammar as
// before on small screens (chips -> swipe gallery -> brand banner -> grid),
// now with real filtering wired in:
//
//   mobile:  filter bar (horizontal scroll)  ->  gallery/banner (only when
//            no filters are active)  ->  2-col results grid  ->  load more
//   desktop: sticky sidebar filters (lg:)  ->  gallery/banner (idem)  ->
//            multi-col results grid  ->  load more
//
// All filtering (collections, featured, search, ordering) happens client
// side via useProductFilters — no full page reload. Filters are mirrored
// into the URL for shareable/back-button-friendly links.
//
// NOTE: sort `value`s in SORT_OPTIONS must match real orderable fields on
// the backend — update the list below to whatever /api/products/ actually
// accepts for `ordering`.
// ---------------------------------------------------------------------------

const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: "-created_at", label: "جدیدترین" },
    { value: "created_at", label: "قدیمی‌ترین" },
    { value: "price", label: "ارزان‌ترین" },
    { value: "-price", label: "گران‌ترین" },
]

interface ProductsExplorerProps {
    initialFeatured?: ProductListItem[]
    collections?: CollectionListItem[]
    className?: string
}

export default function ProductsExplorer({
    initialFeatured = [],
    collections = [],
    className = "",
}: ProductsExplorerProps) {
    const {
        filters,
        searchInput,
        setSearchInput,
        toggleCollection,
        setFeatured,
        setOrdering,
        clearFilters,
        items,
        count,
        hasMore,
        loadMore,
        isLoading,
        isLoadingMore,
        isPending,
        error,
        activeFilterCount,
    } = useProductFilters()

    const showDiscovery = activeFilterCount === 0 && !filters.search

    return (
        <div className={cn("overflow-x-hidden pb-16 lg:overflow-visible", className)}>
            <PageIntro count={count} isLoading={isLoading} />

            <div className="mt-5 lg:mx-auto lg:mt-8 lg:grid lg:max-w-7xl lg:grid-cols-[240px_1fr] lg:items-start lg:gap-10 lg:px-8">
                <FiltersPanel
                    collections={collections}
                    filters={filters}
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    onToggleCollection={toggleCollection}
                    onSetFeatured={setFeatured}
                    onSetOrdering={setOrdering}
                    onClear={clearFilters}
                    activeFilterCount={activeFilterCount}
                />

                <div className={cn("transition-opacity", isPending && "opacity-70")}>
                    {showDiscovery && initialFeatured.length > 0 && (
                        <>
                            <GallerySection items={initialFeatured} />
                            <HeroBanner />
                        </>
                    )}

                    <ResultsGrid
                        items={items}
                        isLoading={isLoading}
                        error={error}
                        hasActiveFilters={activeFilterCount > 0 || Boolean(filters.search)}
                    />

                    {hasMore && !isLoading && (
                        <div className="mt-8 flex justify-center px-5 lg:px-0">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground disabled:opacity-60"
                            >
                                {isLoadingMore ? "در حال بارگذاری..." : "نمایش محصولات بیشتر"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Intro — eyebrow, title, live (filtered) count.
// ---------------------------------------------------------------------------
function PageIntro({ count, isLoading }: { count: number; isLoading: boolean }) {
    return (
        <section className="mt-15 px-5 lg:mx-auto lg:max-w-7xl lg:px-8">
            <Reveal>
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    فروشگاه
                </p>
                <div className="mt-1.5 flex items-end justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                        همه محصولات
                    </h1>
                    <span className="pb-0.5 text-xs text-muted-foreground">
                        {isLoading ? "در حال بارگذاری..." : `${count} محصول`}
                    </span>
                </div>
            </Reveal>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Filters — collections + featured toggle + search + sort. Horizontal
// scroll strip on mobile, sticky vertical sidebar from lg: up.
// ---------------------------------------------------------------------------
interface FiltersPanelProps {
    collections: CollectionListItem[]
    filters: ProductFiltersState
    searchInput: string
    onSearchChange: (value: string) => void
    onToggleCollection: (slug: string) => void
    onSetFeatured: (value: boolean) => void
    onSetOrdering: (value: string) => void
    onClear: () => void
    activeFilterCount: number
}

function FiltersPanel({
    collections,
    filters,
    searchInput,
    onSearchChange,
    onToggleCollection,
    onSetFeatured,
    onSetOrdering,
    onClear,
    activeFilterCount,
}: FiltersPanelProps) {
    const shownCollections = collections.slice(0, 12)

    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="px-5 lg:px-0">
                <label className="relative block">
                    <span className="sr-only">جستجوی محصول</span>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="جستجو در محصولات..."
                        className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </label>
            </div>

            {(shownCollections.length > 0 || true) && (
                <div
                    aria-label="فیلتر بر اساس کالکشن"
                    className={cn(
                        "mt-4 flex snap-x gap-2 overflow-x-auto px-5 pb-1",
                        "scroll-px-5 scrollbar-none overscroll-x-contain [&::-webkit-scrollbar]:hidden",
                        "lg:mt-6 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
                    )}
                >
                    <FilterChip
                        active={filters.featured}
                        onClick={() => onSetFeatured(!filters.featured)}
                        label="ویژه"
                    />
                    {shownCollections.map((collection) => (
                        <FilterChip
                            key={collection.slug}
                            active={filters.collections.includes(collection.slug)}
                            onClick={() => onToggleCollection(collection.slug)}
                            label={collection.title}
                        />
                    ))}
                </div>
            )}

            <div className="mt-4 px-5 lg:mt-6 lg:px-0">
                <label className="block text-xs font-medium text-muted-foreground">
                    مرتب‌سازی
                    <select
                        value={filters.ordering}
                        onChange={(e) => onSetOrdering(e.target.value)}
                        className="mt-1.5 block w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-auto"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {activeFilterCount > 0 && (
                <div className="mt-4 px-5 lg:px-0">
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs font-medium text-muted-foreground underline underline-offset-4"
                    >
                        پاک کردن فیلترها ({activeFilterCount})
                    </button>
                </div>
            )}
        </aside>
    )
}

function FilterChip({
    active,
    onClick,
    label,
}: {
    active: boolean
    onClick: () => void
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                "shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                "lg:w-full lg:text-start",
                active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground"
            )}
        >
            {label}
        </button>
    )
}

// ---------------------------------------------------------------------------
// Gallery — swipeable showcase, shown only while browsing with no active
// filters (once someone filters or searches, this teaser gives way to the
// results grid so the page reads as search results, not a mixed feed).
// ---------------------------------------------------------------------------
function GallerySection({ items }: { items: ProductListItem[] }) {
    const shown = items.slice(0, 6)

    return (
        <section className="mt-2 lg:mt-0">
            <ul
                role="list"
                className={cn(
                    "flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:px-0",
                    "scroll-px-5 overscroll-x-contain",
                    "scrollbar-none [&::-webkit-scrollbar]:hidden"
                )}
            >
                {shown.map((item, idx) => (
                    <li key={item.slug} className="w-[68vw] max-w-64 shrink-0 snap-start lg:w-56">
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
                    sizes="(min-width: 1024px) 224px, 70vw"
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
// Brand banner — unchanged from the mobile version; on desktop it now sits
// inside the results column (next to the sidebar) instead of full-width.
// ---------------------------------------------------------------------------
function HeroBanner() {
    return (
        <section className="relative mx-5 mt-10 aspect-16/10 overflow-hidden rounded-[1.75rem] lg:mx-0 lg:aspect-21/9">
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
// Results grid — 2 columns on mobile, scaling up through the desktop
// breakpoints; skeleton cards while loading, inline error, empty state.
// ---------------------------------------------------------------------------
function ResultsGrid({
    items,
    isLoading,
    error,
    hasActiveFilters,
}: {
    items: ProductListItem[]
    isLoading: boolean
    error: string | null
    hasActiveFilters: boolean
}) {
    return (
        <section className="mt-10">
            <div className="mb-4 px-5 lg:px-0">
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    {hasActiveFilters ? "نتایج فیلتر" : "کاتالوگ کامل"}
                </p>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">
                    {hasActiveFilters ? "محصولات مطابق فیلتر شما" : "مشاهده همه محصولات"}
                </h2>
            </div>

            {error && (
                <div className="mx-5 rounded-xl border border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground lg:mx-0">
                    {error}
                </div>
            )}

            {!error && isLoading && items.length === 0 && (
                <ul className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-3 lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <li key={i} className="aspect-3/4 animate-pulse rounded-xl bg-muted" />
                    ))}
                </ul>
            )}

            {!error && !isLoading && items.length === 0 && (
                <EmptyState hasActiveFilters={hasActiveFilters} />
            )}

            {!error && items.length > 0 && (
                <ul
                    role="list"
                    className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-3 lg:grid-cols-3 lg:px-0 xl:grid-cols-4"
                >
                    {items.map((item, idx) => (
                        <li key={item.slug}>
                            <Reveal delay={(idx % 4) * 50}>
                                <ProductTile item={item} eager={idx < 2} />
                            </Reveal>
                        </li>
                    ))}
                </ul>
            )}
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
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
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
// Empty state — distinguishes "no products at all" from "no matches for
// your filters", since the fix (clear filters vs. come back later) differs.
// ---------------------------------------------------------------------------
function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
    return (
        <div className="px-5 py-24 text-center lg:px-0">
            <p className="text-sm font-medium text-foreground">
                {hasActiveFilters ? "با این فیلترها محصولی پیدا نشد" : "فعلاً محصولی موجود نیست"}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
                {hasActiveFilters
                    ? "فیلترها رو تغییر بده یا پاک کن تا محصولات بیشتری ببینی."
                    : "به‌زودی محصولات جدید اینجا نمایش داده می‌شن."}
            </p>
        </div>
    )
}
