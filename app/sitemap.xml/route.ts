import { SitemapStream, streamToPromise } from "sitemap"
import { getProductSlugs, getPostSlugs } from "@/lib/api/sitemap"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const staticPages = [
    { path: "", changefreq: "daily", priority: 1 },
    { path: "/catalog", changefreq: "daily", priority: 0.9 },
    { path: "/blog", changefreq: "weekly", priority: 0.7 },
    { path: "/about", changefreq: "monthly", priority: 0.5 },
    { path: "/contact", changefreq: "monthly", priority: 0.5 },
    { path: "/faq", changefreq: "monthly", priority: 0.5 },
    { path: "/shipping-returns", changefreq: "monthly", priority: 0.5 },
]

const dynamicPages = [
    { fetch: getProductSlugs, prefix: "/p" },
    { fetch: getPostSlugs, prefix: "/blog" },
]

async function buildSitemap(): Promise<string> {
    const stream = new SitemapStream({ hostname: SITE_URL })

    for (const page of staticPages) {
        stream.write({
            url: `${SITE_URL}${page.path}`,
            changefreq: page.changefreq,
            priority: page.priority,
        })
    }

    for (const { fetch, prefix } of dynamicPages) {
        const items = await fetch()
        for (const item of items) {
            stream.write({
                url: `${SITE_URL}${prefix}/${item.slug}`,
                lastmod: item.updated_at || undefined,
                changefreq: "weekly",
                priority: 0.6,
            })
        }
    }

    stream.end()
    const data = await streamToPromise(stream)
    return data.toString()
}

export async function GET(): Promise<Response> {
    const xml = await buildSitemap()
    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    })
}
