import request from "@/lib/api/client"
import { ProductList, ProductDetail } from "@/types/product"

// ---------------------------------------------------------------------------
// Filter params matching the /api/products/ query schema:
//   collections  -> comma-separated list of collection slugs
//   featured     -> boolean
//   ordering     -> field name for DRF-style ordering (e.g. "-created_at")
//   page / page_size -> pagination
//   search       -> free-text search term
// ---------------------------------------------------------------------------
export interface ProductQueryParams {
    collections?: string[]
    featured?: boolean
    ordering?: string
    page?: number
    page_size?: number
    search?: string
}

function buildProductsQuery(params: ProductQueryParams = {}): string {
    const qs = new URLSearchParams()

    if (params.collections && params.collections.length > 0) {
        qs.set("collections", params.collections.join(","))
    }
    if (typeof params.featured === "boolean") {
        qs.set("featured", String(params.featured))
    }
    if (params.ordering) {
        qs.set("ordering", params.ordering)
    }
    if (params.page) {
        qs.set("page", String(params.page))
    }
    if (params.page_size) {
        qs.set("page_size", String(params.page_size))
    }
    if (params.search && params.search.trim().length > 0) {
        qs.set("search", params.search.trim())
    }

    const query = qs.toString()
    return query ? `?${query}` : ""
}

/**
 * Generic, filterable products fetch. Pass an AbortSignal from the caller
 * (e.g. a client component doing live filtering) so in-flight requests can
 * be cancelled when the filters change again before the previous request
 * resolves.
 *
 * NOTE: this assumes `request()` forwards a `signal` option straight into
 * its underlying fetch call. If your `@/lib/api/client` wrapper doesn't
 * accept/forward `signal` yet, add that passthrough there — otherwise stale
 * responses can't be cancelled and may race with newer ones.
 */
export function getProducts(
    params: ProductQueryParams = {},
    signal?: AbortSignal
): Promise<ProductList> {
    return request<ProductList>(`/api/products/${buildProductsQuery(params)}`, {
        method: "GET",
        signal,
    })
}

// Kept for backward compatibility with existing call sites; both are now
// thin wrappers around getProducts().
export function getLatestProducts(): Promise<ProductList> {
    return getProducts()
}

export function getFeaturedProducts(): Promise<ProductList> {
    return getProducts({ featured: true })
}

export function getProduct(slug: string): Promise<ProductDetail | null> {
    return request<ProductDetail>(`/api/products/${slug}/`, {
        method: "GET",
    })
}
