"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getProducts } from "@/lib/api/product"
import type { ProductListItem, ProductList } from "@/types/product"

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 350

// Adjust to whatever the backend's default ordering field actually is.
const DEFAULT_ORDERING = "-created_at"

export interface ProductFiltersState {
    collections: string[]
    featured: boolean
    search: string
    ordering: string
}

function parseFiltersFromSearchParams(sp: URLSearchParams): ProductFiltersState {
    const collectionsRaw = sp.get("collections")
    return {
        collections: collectionsRaw ? collectionsRaw.split(",").filter(Boolean) : [],
        featured: sp.get("featured") === "true",
        search: sp.get("search") ?? "",
        ordering: sp.get("ordering") ?? DEFAULT_ORDERING,
    }
}

/**
 * Owns all product-listing state: active filters, the fetched page of
 * results, pagination, and loading/error state. Filters are mirrored into
 * the URL via router.replace (shallow, scroll: false) purely for
 * shareable/bookmarkable links and back-button support — the actual data
 * refetch is a plain client-side fetch, so nothing here ever triggers a
 * full page reload or a server round-trip for the page itself.
 */
export function useProductFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState<ProductFiltersState>(() =>
        parseFiltersFromSearchParams(searchParams)
    )
    const [searchInput, setSearchInput] = useState(filters.search)

    const [items, setItems] = useState<ProductListItem[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const abortRef = useRef<AbortController | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isFirstRun = useRef(true)

    const syncUrl = useCallback(
        (next: ProductFiltersState) => {
            const qs = new URLSearchParams()
            if (next.collections.length > 0) qs.set("collections", next.collections.join(","))
            if (next.featured) qs.set("featured", "true")
            if (next.search) qs.set("search", next.search)
            if (next.ordering && next.ordering !== DEFAULT_ORDERING)
                qs.set("ordering", next.ordering)

            const query = qs.toString()
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
        },
        [pathname, router]
    )

    const fetchProducts = useCallback(
        (f: ProductFiltersState, targetPage: number, append: boolean) => {
            abortRef.current?.abort()
            const controller = new AbortController()
            abortRef.current = controller

            if (append) setIsLoadingMore(true)
            else setIsLoading(true)
            setError(null)

            getProducts(
                {
                    collections: f.collections.length ? f.collections : undefined,
                    featured: f.featured || undefined,
                    search: f.search || undefined,
                    ordering: f.ordering,
                    page: targetPage,
                    page_size: PAGE_SIZE,
                },
                controller.signal
            )
                .then((res: ProductList) => {
                    setItems((prev) => (append ? [...prev, ...res.results] : res.results))
                    setCount(res.count)
                    setHasMore(Boolean(res.next))
                    setPage(targetPage)
                })
                .catch((err: unknown) => {
                    if (err instanceof DOMException && err.name === "AbortError") return
                    setError("مشکلی در دریافت محصولات پیش اومد. لطفاً دوباره تلاش کن.")
                })
                .finally(() => {
                    if (append) setIsLoadingMore(false)
                    else setIsLoading(false)
                })
        },
        []
    )

    // Refetch whenever collections / featured / ordering / (debounced) search change.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts(filters, 1, false)
        // Don't rewrite the URL on the very first run — it's already correct,
        // and re-writing it would drop any extra query params the page owns.
        if (!isFirstRun.current) syncUrl(filters)
        isFirstRun.current = false
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.collections.join(","), filters.featured, filters.ordering, filters.search])

    // Debounce the free-text search box into filters.search.
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setFilters((prev) =>
                prev.search === searchInput ? prev : { ...prev, search: searchInput }
            )
        }, SEARCH_DEBOUNCE_MS)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [searchInput])

    const toggleCollection = useCallback((slug: string) => {
        startTransition(() => {
            setFilters((prev) => {
                const has = prev.collections.includes(slug)
                return {
                    ...prev,
                    collections: has
                        ? prev.collections.filter((c) => c !== slug)
                        : [...prev.collections, slug],
                }
            })
        })
    }, [])

    const setFeatured = useCallback((value: boolean) => {
        startTransition(() => setFilters((prev) => ({ ...prev, featured: value })))
    }, [])

    const setOrdering = useCallback((value: string) => {
        startTransition(() => setFilters((prev) => ({ ...prev, ordering: value })))
    }, [])

    const clearFilters = useCallback(() => {
        setSearchInput("")
        startTransition(() =>
            setFilters({ collections: [], featured: false, search: "", ordering: DEFAULT_ORDERING })
        )
    }, [])

    const loadMore = useCallback(() => {
        if (!hasMore || isLoadingMore) return
        fetchProducts(filters, page + 1, true)
    }, [fetchProducts, filters, hasMore, isLoadingMore, page])

    const activeFilterCount = useMemo(
        () => filters.collections.length + (filters.featured ? 1 : 0) + (filters.search ? 1 : 0),
        [filters]
    )

    return {
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
    }
}
