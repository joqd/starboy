"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { getProducts, ProductOrdering, ProductQueryParams } from "@/lib/api/product"
import { getCollections } from "@/lib/api/collection"
import type { ProductListItem } from "@/types/product"
import type { CollectionListItem } from "@/types/collection"
import { PageContainer } from "@/components/layout/page-container"
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { CollectionFilter } from "@/components/product/collection-filter"
import { FeaturedFilterValue } from "@/components/product/featured-filter"
import { SortFilter } from "@/components/product/sort-filter"

const PAGE_SIZE = 16
const DEFAULT_ORDERING: ProductOrdering = "created_at"
const VALID_ORDERINGS: ProductOrdering[] = ["created_at", "-created_at", "price", "-price"]

export const dynamic = "force-dynamic"

interface ProductFilterValues {
    collection: string | null
    featured: FeaturedFilterValue
    search: string
    ordering: ProductOrdering
    inStockOnly: boolean
}

function parseFiltersFromParams(params: URLSearchParams): ProductFilterValues {
    const ordering = params.get("sort")
    const featuredRaw = params.get("featured")

    return {
        collection: params.get("collection") || null,
        featured: featuredRaw ? (featuredRaw as FeaturedFilterValue) : null,
        search: params.get("q") || "",
        ordering:
            ordering && VALID_ORDERINGS.includes(ordering as ProductOrdering)
                ? (ordering as ProductOrdering)
                : DEFAULT_ORDERING,
        inStockOnly: params.get("in_stock") === "true",
    }
}

function filtersToSearchParams(filters: ProductFilterValues): URLSearchParams {
    const params = new URLSearchParams()

    if (filters.collection) params.set("collection", filters.collection)
    if (filters.featured) params.set("featured", filters.featured)
    if (filters.search) params.set("q", filters.search)
    if (filters.ordering !== DEFAULT_ORDERING) params.set("sort", filters.ordering)
    if (filters.inStockOnly) params.set("in_stock", "true")

    return params
}

function filtersEqual(a: ProductFilterValues, b: ProductFilterValues): boolean {
    return (
        a.collection === b.collection &&
        a.featured === b.featured &&
        a.search === b.search &&
        a.ordering === b.ordering &&
        a.inStockOnly === b.inStockOnly
    )
}

export default function ProductsPage() {
    // useSearchParams() needs a Suspense boundary around it in the App
    // Router — the fallback only matters for the very first paint.
    return (
        <Suspense fallback={null}>
            <ProductsPageContent />
        </Suspense>
    )
}

function ProductsPageContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [collections, setCollections] = useState<CollectionListItem[]>([])
    // Lazy-initialized straight from the URL so a deep link (e.g. coming
    // from a collection page) loads pre-filtered on the very first fetch,
    // instead of fetching once with defaults and again with real filters.
    const [filters, setFilters] = useState<ProductFilterValues>(() =>
        parseFiltersFromParams(searchParams)
    )
    const [items, setItems] = useState<ProductListItem[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Local draft for the search box so typing doesn't refetch on every
    // keystroke — pushed into `filters` 350ms after the user stops typing.
    const [searchDraft, setSearchDraft] = useState(
        () => parseFiltersFromParams(searchParams).search
    )

    const abortRef = useRef<AbortController | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const hasMore = items.length < count

    // Drives the little count badge on the mobile "فیلتر و مرتب‌سازی" button —
    // deliberately excludes the free-text search since that already has its
    // own always-visible input.
    const activeFilterCount =
        (filters.collection ? 1 : 0) +
        (filters.featured ? 1 : 0) +
        (filters.ordering !== DEFAULT_ORDERING ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0)

    const buildParams = useCallback(
        (targetPage: number): ProductQueryParams => ({
            page: targetPage,
            page_size: PAGE_SIZE,
            ordering: filters.ordering,
            search: filters.search || undefined,
            featured: filters.featured === null ? undefined : filters.featured === "featured",
            collections: filters.collection ? [filters.collection] : undefined,
            in_stock: filters.inStockOnly ? true : undefined,
        }),
        [filters]
    )

    // Fetch the collections list once, for the filter dropdown. Uses a
    // closure-local `cancelled` flag rather than a ref: this is freshly
    // created on every effect invocation, so it's naturally safe under
    // Strict Mode's dev-only mount→cleanup→mount replay — unlike a ref,
    // it can't leak a stale value from a "phantom" run into the real one.
    useEffect(() => {
        let cancelled = false

        getCollections()
            .then((data) => {
                if (!cancelled) setCollections(data.results)
            })
            .catch(() => {
                if (!cancelled) setCollections([])
            })

        return () => {
            cancelled = true
        }
    }, [])

    // Keep `filters` (and the search box draft) in sync with the URL when
    // it changes from outside this component's own writes — e.g. the user
    // hits back/forward, or lands here via a link like
    // /products?collection=summer-sale from the collections page.
    //
    // This also runs right after *our own* URL writes below, but is a
    // no-op then: the parsed filters already match current state, so
    // setFilters bails out via filtersEqual and no extra render/fetch
    // happens. That's what keeps the two effects from ping-ponging.
    useEffect(() => {
        const parsed = parseFiltersFromParams(searchParams)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters((prev) => (filtersEqual(prev, parsed) ? prev : parsed))
        setSearchDraft((prev) => (prev === parsed.search ? prev : parsed.search))
    }, [searchParams])

    // Mirror `filters` into the URL query string. `router.replace` (not
    // `push`) is used so adjusting filters doesn't spam the browser history
    // — only the page's own back button should navigate away from /products.
    useEffect(() => {
        const nextQuery = filtersToSearchParams(filters).toString()
        const currentQuery = searchParams.toString()
        if (nextQuery === currentQuery) return

        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pathname])

    // Fetch page 1 of products whenever `filters` changes — including on
    // mount, since `filters` starts out parsed from the URL. There's no
    // separate "initial load" effect: it would do exactly the same thing as
    // this one, and trying to skip this effect's first run with a ref is
    // fragile under Strict Mode (see note in the chat). Aborting any
    // in-flight request before starting a new one, and again on cleanup,
    // keeps this correct no matter how many times React invokes it.
    useEffect(() => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        getProducts(buildParams(1), controller.signal)
            .then((data) => {
                setItems(data.results)
                setCount(data.count)
                setPage(1)
            })
            .catch((error: unknown) => {
                if ((error as { name?: string })?.name !== "AbortError") console.error(error)
            })
            .finally(() => setLoading(false))

        return () => controller.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    // Debounce the search input into `filters`.
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters((prev) =>
                prev.search === searchDraft ? prev : { ...prev, search: searchDraft }
            )
        }, 350)
        return () => clearTimeout(timeout)
    }, [searchDraft])

    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) return

        const nextPage = page + 1
        const controller = new AbortController()
        abortRef.current = controller

        setLoadingMore(true)
        getProducts(buildParams(nextPage), controller.signal)
            .then((data) => {
                setItems((prev) => [...prev, ...data.results])
                setCount(data.count)
                setPage(nextPage)
            })
            .catch((error: unknown) => {
                if ((error as { name?: string })?.name !== "AbortError") console.error(error)
            })
            .finally(() => setLoadingMore(false))
    }, [buildParams, loading, loadingMore, hasMore, page])

    // Fires loadMore as soon as the sentinel scrolls near the viewport —
    // this is what makes the grid "lazy load" instead of paginating.
    useEffect(() => {
        const node = sentinelRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) loadMore()
            },
            { rootMargin: "600px 0px" }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [loadMore])

    return (
        <PageContainer className="pb-16">
            <section>
                <p className="text-[10px] font-medium text-muted-foreground uppercase">
                    فروشگاه
                </p>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    همه محصولات
                </h1>
            </section>

            <section className="mt-6">
                {/* Tablet / desktop — unchanged inline toolbar */}
                <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex flex-1 flex-row flex-wrap items-center gap-3">
                        <div className="relative w-56">
                            <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchDraft}
                                onChange={(e) => setSearchDraft(e.target.value)}
                                placeholder="جست‌وجوی محصول…"
                                className="pr-9"
                            />
                        </div>

                        <CollectionFilter
                            value={filters.collection}
                            collections={collections}
                            onChange={(collection) =>
                                setFilters((prev) => ({ ...prev, collection }))
                            }
                        />

                        <SortFilter
                            value={filters.ordering}
                            onChange={(ordering) => setFilters((prev) => ({ ...prev, ordering }))}
                        />
                    </div>

                    <span className="pb-0.5 text-xs whitespace-nowrap text-muted-foreground">
                        {count} محصول
                    </span>
                </div>

                {/* Mobile — a real search field up top, and a single "فیلتر و
                    مرتب‌سازی" trigger that opens a bottom sheet, instead of
                    cramming a search box + two full-width selects into a
                    column. */}
                <div className="flex flex-col gap-3 sm:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchDraft}
                            onChange={(e) => setSearchDraft(e.target.value)}
                            placeholder="جست‌وجوی محصول…"
                            className="h-11 rounded-xl border-border/60 bg-card pr-10 pl-9 text-sm"
                        />
                        {searchDraft && (
                            <button
                                type="button"
                                onClick={() => setSearchDraft("")}
                                aria-label="پاک کردن جست‌وجو"
                                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Sheet>
                            <SheetTrigger
                                type="button"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "lg",
                                })}
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                فیلتر و مرتب‌سازی
                                {activeFilterCount > 0 && (
                                    <Badge className="h-5 min-w-5 rounded-full border-transparent bg-foreground px-1 text-[10px] text-background">
                                        {activeFilterCount.toLocaleString("fa-IR")}
                                    </Badge>
                                )}
                            </SheetTrigger>

                            <SheetContent
                                dir="rtl"
                                side="bottom"
                                className="rounded-t-3xl px-5 pt-10 pb-8"
                            >
                                <div className="mt-2 flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            دسته‌بندی
                                        </span>
                                        <CollectionFilter
                                            value={filters.collection}
                                            collections={collections}
                                            onChange={(collection) =>
                                                setFilters((prev) => ({ ...prev, collection }))
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            مرتب‌سازی
                                        </span>
                                        <SortFilter
                                            value={filters.ordering}
                                            onChange={(ordering) =>
                                                setFilters((prev) => ({ ...prev, ordering }))
                                            }
                                        />
                                    </div>
                                </div>

                                <SheetFooter
                                    dir="ltr"
                                    className="mt-6 flex-row gap-2 sm:justify-start"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1"
                                        disabled={activeFilterCount === 0}
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                collection: null,
                                                featured: null,
                                                ordering: DEFAULT_ORDERING,
                                                inStockOnly: false,
                                            }))
                                        }
                                    >
                                        پاک کردن
                                    </Button>
                                    <SheetClose
                                        type="button"
                                        className={buttonVariants({ className: "flex-1" })}
                                    >
                                        نمایش {count.toLocaleString("fa-IR")} محصول
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>

                        <span className="text-xs text-muted-foreground">{count} محصول</span>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                {items.length === 0 && !loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="py-24 text-center"
                    >
                        <p className="text-sm font-medium text-foreground">
                            محصولی با این فیلترها پیدا نشد
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            فیلترها رو تغییر بده یا جست‌وجوی دیگه‌ای امتحان کن.
                        </p>
                    </motion.div>
                ) : (
                    <motion.ul
                        role="list"
                        layout
                        animate={{ opacity: loading ? 0.5 : 1 }}
                        transition={{ opacity: { duration: 0.2 } }}
                        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                            loading ? "pointer-events-none" : ""
                        }`}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {items.map((item, idx) => (
                                <motion.li
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{
                                        // Repositioning (sort/filter changes) gets a
                                        // pronounced fast-start, slow-finish curve so the
                                        // movement itself reads clearly to the eye.
                                        layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                                        opacity: { duration: 0.22 },
                                        scale: { duration: 0.22 },
                                    }}
                                >
                                    <ProductCard
                                        product={item}
                                        eager={idx < 4}
                                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
                                    />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </motion.ul>
                )}

                {loading && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Invisible trigger the IntersectionObserver watches to load the next page */}
                <div ref={sentinelRef} aria-hidden className="h-px w-full" />

                {loadingMore && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductCardSkeleton key={`more-${i}`} />
                        ))}
                    </div>
                )}
            </section>
        </PageContainer>
    )
}
