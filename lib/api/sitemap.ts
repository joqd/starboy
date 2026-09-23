import request from "@/lib/api/client"
import type { SitemapItem } from "@/types/sitemap"

export function getProductSlugs(): Promise<SitemapItem[]> {
    return request<SitemapItem[]>("/seo/sitemap/products/", {
        method: "GET",
    })
}

export function getPostSlugs(): Promise<SitemapItem[]> {
    return request<SitemapItem[]>("/seo/sitemap/posts/", {
        method: "GET",
    })
}
