import { cache } from "react"
import type { ProductListItem } from "@/types/product"

// ---------------------------------------------------------------------------
// TODO(backend): there's no related-products endpoint for blog posts yet.
// Once one exists (something like GET /api/blog/posts/{slug}/related-products/),
// replace the body of getRelatedProducts below with a real `request()` call —
// same shape as getLatestPosts/getPost in lib/api/post.ts. Every caller
// (the inline slots inside the article body and the section at the end)
// goes through this one function, so that's the entire migration.
//
// Wrapped in React's cache() so a single post page — which may call this
// two or three times (once per inline slot, once for the closing section)
// — only pays for one fetch per request instead of one per call site.
// ---------------------------------------------------------------------------
export const getRelatedProducts = cache(async function getRelatedProducts(
    postSlug: string,
    limit = 6
): Promise<ProductListItem[]> {
    // Placeholder data, mirroring the mock pattern already used for
    // featured products / collections on the home page.
    const mock: ProductListItem[] = [
        {
            slug: "sample-product-1",
            title: "محصول نمونه یک",
            images: [{ image: "https://placehold.co/400x533" }],
            variants: [{ price: 890000, stock: 4 }],
        },
        {
            slug: "sample-product-2",
            title: "محصول نمونه دو",
            images: [{ image: "https://placehold.co/400x533" }],
            variants: [{ price: 1250000, stock: 0 }],
        },
        {
            slug: "sample-product-3",
            title: "محصول نمونه سه",
            images: [{ image: "https://placehold.co/400x533" }],
            variants: [{ price: 640000, stock: 12 }],
        },
    ] as unknown as ProductListItem[]

    void postSlug // will key the real request once the endpoint exists

    return mock.slice(0, limit)
})
