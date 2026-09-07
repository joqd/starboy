import request from "@/lib/api/client"
import { ProductList, ProductDetail } from "@/types/product"

// ---------------------------------------------------------------------------
// Filter params matching the /api/products/ query schema:
//   collections  -> comma-separated list of collection slugs
//   featured     -> boolean
//   ordering     -> field name for DRF-style ordering (e.g. "-created_at")
//   page / page_size -> pagination (used internally for infinite loading)
//   search       -> free-text search term
// ---------------------------------------------------------------------------
export interface ProductQueryParams {
    collections?: string[]
    featured?: boolean
    ordering?: string
    page?: number
    page_size?: number
    search?: string
    in_stock?: boolean
}

// The four sort options exposed in the UI. Adjust the DRF field names below
// ("price" / "created_at") if your backend serializer uses different ones.
export type ProductOrdering = "-created_at" | "created_at" | "price" | "-price"

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
    if (typeof params.in_stock === "boolean") {
        qs.set("in_stock", String(params.in_stock))
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
