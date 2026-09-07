"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { getProducts, ProductOrdering, ProductQueryParams } from "@/lib/api/product"
import { getCollections } from "@/lib/api/collection"
import type { ProductListItem } from "@/types/product"
import type { CollectionListItem } from "@/types/collection"
import { PageContainer } from "@/components/layout/page-container"
import { ProductCard } from "@/components/product/product-card"
import { Input } from "@/components/ui/input"
import { CollectionFilter } from "@/components/product/collection-filter"
import { FeaturedFilterValue } from "@/components/product/featured-filter"
import { SortFilter } from "@/components/product/sort-filter"

// ---------------------------------------------------------------------------
// Products page — no pagination: the grid lazy-loads (infinite scroll) via
// an IntersectionObserver sentinel. Filters (collection / featured / search
// / sort) live in this same client component so they can drive refetching
// directly. Each Select-based filter is its own small component styled to
// match <StatusFilter>, the same way the orders page does it.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 16
const DEFAULT_ORDERING: ProductOrdering = "created_at"

interface ProductFilterValues {
    collection: string | null
    featured: FeaturedFilterValue
    search: string
    ordering: ProductOrdering
}

const DEFAULT_FILTERS: ProductFilterValues = {
    collection: null,
    featured: null,
    search: "",
    ordering: DEFAULT_ORDERING,
}

export default function ProductsPage() {
    const [collections, setCollections] = useState<CollectionListItem[]>([])
    const [filters, setFilters] = useState<ProductFilterValues>(DEFAULT_FILTERS)
    const [items, setItems] = useState<ProductListItem[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Local draft for the search box so typing doesn't refetch on every
    // keystroke — pushed into `filters` 350ms after the user stops typing.
    const [searchDraft, setSearchDraft] = useState("")

    const abortRef = useRef<AbortController | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const hasMore = items.length < count

    const buildParams = useCallback(
        (targetPage: number): ProductQueryParams => ({
            page: targetPage,
            page_size: PAGE_SIZE,
            ordering: filters.ordering,
            search: filters.search || undefined,
            featured: filters.featured === null ? undefined : filters.featured === "featured",
            collections: filters.collection ? [filters.collection] : undefined,
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

    // Fetch page 1 of products whenever `filters` changes — including on
    // mount, since `filters` starts out as DEFAULT_FILTERS. There's no
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
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    فروشگاه
                </p>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    همه محصولات
                </h1>
            </section>

            <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative w-full sm:w-56">
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
                        onChange={(collection) => setFilters((prev) => ({ ...prev, collection }))}
                    />

                    {/* <FeaturedFilter
                            value={filters.featured}
                            onChange={(featured) => setFilters((prev) => ({ ...prev, featured }))}
                        /> */}

                    <SortFilter
                        value={filters.ordering}
                        onChange={(ordering) => setFilters((prev) => ({ ...prev, ordering }))}
                    />
                </div>

                <span className="text-xs text-muted-foreground sm:pb-0.5 sm:whitespace-nowrap">
                    {count} محصول
                </span>
            </section>

            <section className="mt-8">
                {items.length === 0 && !loading ? (
                    <div className="py-24 text-center">
                        <p className="text-sm font-medium text-foreground">
                            محصولی با این فیلترها پیدا نشد
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            فیلترها رو تغییر بده یا جست‌وجوی دیگه‌ای امتحان کن.
                        </p>
                    </div>
                ) : (
                    <ul
                        role="list"
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                    >
                        {items.map((item, idx) => (
                            <li key={item.id}>
                                <ProductCard
                                    product={item}
                                    eager={idx < 4}
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {loading && (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <div key={i} className="aspect-3/4 animate-pulse rounded-2xl bg-card" />
                        ))}
                    </div>
                )}

                {/* Invisible trigger the IntersectionObserver watches to load the next page */}
                <div ref={sentinelRef} aria-hidden className="h-px w-full" />

                {loadingMore && (
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        در حال بارگذاری محصولات بیشتر…
                    </p>
                )}

                {/* {!hasMore && items.length > 0 && !loading && (
                        <p className="mt-8 text-center text-xs text-muted-foreground">
                            همه محصولات نمایش داده شد
                        </p>
                    )} */}
            </section>
        </PageContainer>
    )
}
