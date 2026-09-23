import request from "@/lib/api/client"
import type { SitemapItem } from "@/types/sitemap"

const PAGE_SIZE = 200

interface PaginatedPage<T> {
    next: string | null
    results: T[]
}

interface ProductOrPostListItem {
    slug: string
    published_at: string | null
}

// Walk every page of a DRF-style paginated list endpoint and collect all
// results, so the sitemap covers the full catalog rather than just the first
// page. Returns [] on failure instead of letting the whole sitemap 500.
async function fetchAllSlugs(path: string): Promise<SitemapItem[]> {
    const items: SitemapItem[] = []
    let pageNumber = 1

    while (true) {
        const separator = path.includes("?") ? "&" : "?"
        let page: PaginatedPage<ProductOrPostListItem>

        try {
            page = await request<PaginatedPage<ProductOrPostListItem>>(
                `${path}${separator}page=${pageNumber}&page_size=${PAGE_SIZE}`,
                { method: "GET" }
            )
        } catch (err) {
            console.error(`[sitemap] failed to fetch slugs from ${path}`, err)
            return items
        }

        for (const item of page.results) {
            items.push({ slug: item.slug, updated_at: item.published_at ?? "" })
        }

        if (!page.next) break
        pageNumber += 1
    }

    return items
}

export function getProductSlugs(): Promise<SitemapItem[]> {
    return fetchAllSlugs("/api/products/")
}

export function getPostSlugs(): Promise<SitemapItem[]> {
    return fetchAllSlugs("/api/blog/posts/")
}
