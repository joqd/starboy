import type { ProductListItem } from "@/types/product"

// ---------------------------------------------------------------------------
// Test/mock data for the mobile home sections that don't have a real
// endpoint wired up yet (featured products, collections, recent posts).
//
// Each function is `async` and shaped exactly like a real API call would be
// (same signature as `getLatestProducts` in @/lib/api/product) even though
// it just resolves with static data right now. That's on purpose: when the
// real endpoints exist, swapping the function body for an actual fetch is a
// one-line change in each function — nothing in mobile-home.tsx needs to
// change, since it only ever sees "a promise of a list."
//
// Image paths point at /mock/... — drop placeholder files there (or point
// them at real asset URLs) rather than using a remote placeholder service,
// since Next/Image needs remote hosts allow-listed in next.config anyway.
// ---------------------------------------------------------------------------

export interface CollectionListItem {
    slug: string
    title: string
    image: string
    productCount: number
}

export interface PostListItem {
    slug: string
    title: string
    coverImage: string
    publishedAt: string
    excerpt: string
}

function mockProduct(i: number, overrides: Partial<ProductListItem> = {}): ProductListItem {
    return {
        slug: `mock-product-${i}`,
        title: `محصول نمونه ${i}`,
        images: [{ image: `/mock/products/${i}.jpg` }],
        variants: [{ price: 1_250_000 + i * 35_000, stock: i % 5 === 0 ? 0 : 3 }],
        ...overrides,
    } as ProductListItem
}

export async function getFeaturedProducts(): Promise<ProductListItem[]> {
    return Array.from({ length: 6 }, (_, i) => mockProduct(i + 1))
}

export async function getCollections(): Promise<CollectionListItem[]> {
    return [
        {
            slug: "sunset",
            title: "کالکشن سان‌ست",
            image: "/mock/collections/1.jpg",
            productCount: 12,
        },
        {
            slug: "midnight",
            title: "کالکشن میدنایت",
            image: "/mock/collections/2.jpg",
            productCount: 8,
        },
        {
            slug: "essentials",
            title: "اسنشیالز",
            image: "/mock/collections/3.jpg",
            productCount: 20,
        },
        {
            slug: "limited",
            title: "ادیشن محدود",
            image: "/mock/collections/4.jpg",
            productCount: 5,
        },
    ]
}

export async function getRecentPosts(): Promise<PostListItem[]> {
    return [
        {
            slug: "behind-the-scenes",
            title: "پشت صحنه‌ی طراحی کالکشن جدید",
            coverImage: "/mock/posts/1.jpg",
            publishedAt: "1404/05/12",
            excerpt: "نگاهی به فرآیند طراحی و تولید کالکشن تازه استاربوی.",
        },
        {
            slug: "styling-guide",
            title: "راهنمای ترکیب رنگ در پاییز",
            coverImage: "/mock/posts/2.jpg",
            publishedAt: "1404/05/05",
            excerpt: "چند ترکیب ساده برای استایل روزمره‌ی پاییزی.",
        },
        {
            slug: "material-story",
            title: "داستان پارچه‌هایی که استفاده می‌کنیم",
            coverImage: "/mock/posts/3.jpg",
            publishedAt: "1404/04/28",
            excerpt: "چرا کیفیت پارچه براش اهمیت زیادی داره.",
        },
    ]
}
