import Image from "next/image"
import Link from "next/link"
import { HeroImage } from "@/components/layout/hero-image"
import type { ProductListItem } from "@/types/product"
import type { LatestPost } from "@/hooks/use-posts"
import type { CollectionListItem } from "@/types/collection"
import { getFeaturedProducts } from "@/lib/mock/home-mock-data"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mobile home page — a full, editorial storefront layout instead of a
// single slider or a single grid. Every section below is a plain server
// component: no "use client", no motion library, no per-frame work. The
// only interactivity is native browser scroll (horizontal scroll-snap
// strips) and next/font-level static rendering — the same "boring is fast"
// approach as the earlier grid.
//
// Sections: hero -> featured -> collections -> recent products -> recent
// posts. Featured/collections still use mock data (see
// @/lib/mock/home-mock-data) since those endpoints don't exist yet; recent
// products and recent posts use whatever the caller already fetched for
// real (see page.tsx: getLatestProducts / getLatestPosts).
// ---------------------------------------------------------------------------

interface MobileHomeProps {
    recentProducts: ProductListItem[]
    recentPosts: LatestPost[]
    collections: CollectionListItem[]
    className?: string
}

export default async function MobileHome({
    recentProducts,
    recentPosts,
    collections,
    className = "",
}: MobileHomeProps) {
    // Mock sections resolve instantly today; kept as awaited calls so this
    // component doesn't change shape once they're real fetches.
    const [featured] = await Promise.all([getFeaturedProducts()])

    return (
        // overflow-x-hidden here is a defensive backstop, not the fix for
        // the horizontal-scroll bug itself — that was <main>'s w-screen in
        // page.tsx (100vw doesn't subtract the scrollbar's width). Keeping
        // this too means a future child that overflows its container
        // slightly won't reopen the same page-level scroll.
        <div className={cn("overflow-x-hidden pb-16", className)}>
            <MobileHero />
            <FeaturedSection items={featured} />
            <CollectionsSection items={collections} />
            <RecentProductsSection items={recentProducts} />
            <PostsSection items={recentPosts} />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Shared section header: title + optional "view all" link, used by every
// section below so spacing/typography stays consistent without repeating it.
// ---------------------------------------------------------------------------
function SectionHeader({ title, href }: { title: string; href?: string }) {
    return (
        <div className="mb-3 flex items-baseline justify-between px-4">
            <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
            {href && (
                <Link href={href} className="text-xs font-medium text-muted-foreground">
                    مشاهده همه
                </Link>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Hero — the artistic use of the brand hero image. Wrapped in a rounded,
// gradient-scrimmed panel instead of the desktop layout's small corner
// placement, since on mobile this is the first thing a visitor sees and
// should read as a proper banner, not an afterthought.
// ---------------------------------------------------------------------------
function MobileHero() {
    return (
        <section className="relative mx-4 mt-4 aspect-4/5 overflow-hidden rounded-[2rem]">
            <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                <HeroImage />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-neutral-50">
                <p className="text-xs tracking-[0.2em] uppercase opacity-80">کالکشن جدید</p>
                <h1 className="mt-1 text-2xl leading-tight font-bold">استایل خودت رو بساز</h1>
                <Link
                    href="/shop"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-900"
                >
                    مشاهده فروشگاه
                </Link>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Horizontal scroll strip wrapper — native scroll-snap, no JS. Shared by
// featured products, collections, and posts so the swipe behavior and edge
// padding are identical across sections.
// ---------------------------------------------------------------------------
function ScrollStrip({ children }: { children: React.ReactNode }) {
    return (
        <ul
            role="list"
            className={cn(
                "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1",
                "scroll-px-4 overscroll-x-contain",
                "scrollbar-none [&::-webkit-scrollbar]:hidden"
            )}
        >
            {children}
        </ul>
    )
}

function FeaturedSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-10">
            <SectionHeader title="محصولات ویژه" href="/shop" />
            <ScrollStrip>
                {items.map((item, idx) => (
                    <li key={item.slug} className="w-36 shrink-0 snap-start">
                        <ProductTile item={item} eager={idx < 2} />
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

function CollectionsSection({ items }: { items: CollectionListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-10">
            <SectionHeader title="کالکشن‌ها" />
            <ScrollStrip>
                {items.map((collection, idx) => (
                    <li key={collection.slug} className="w-40 shrink-0 snap-start">
                        <Link
                            href={`/collections/${collection.slug}`}
                            className="relative block aspect-3/4 overflow-hidden rounded-2xl"
                        >
                            {collection.image && (
                                <Image
                                    src={collection.image}
                                    alt={collection.title}
                                    fill
                                    sizes="160px"
                                    className="object-cover"
                                    loading={idx < 2 ? "eager" : "lazy"}
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-3 text-neutral-50">
                                <p className="text-sm font-semibold">{collection.title}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

function RecentProductsSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-10">
            <SectionHeader title="جدیدترین محصولات" href="/shop" />
            <ul role="list" className="grid grid-cols-2 gap-3 px-4">
                {items.map((item, idx) => (
                    <li key={item.slug}>
                        <ProductTile item={item} eager={idx < 2} />
                    </li>
                ))}
            </ul>
        </section>
    )
}

function PostsSection({ items }: { items: LatestPost[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-10">
            <SectionHeader title="آخرین مطالب" href="/blog" />
            <ScrollStrip>
                {items.map((post, idx) => (
                    <li key={post.slug} className="w-60 shrink-0 snap-start">
                        <PostTile post={post} eager={idx < 2} />
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

// Separate from ProductTile: the post card has its own fields (nullable
// cover image, category badge, published date) and needs its own fallback
// for posts with no featured_image rather than reusing the product tile's
// stock/price logic.
function PostTile({ post, eager }: { post: LatestPost; eager: boolean }) {
    return (
        <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                {post.featured_image ? (
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        sizes="240px"
                        className="object-cover"
                        loading={eager ? "eager" : "lazy"}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                        بدون تصویر
                    </div>
                )}
                {/* {post.category && (
                    <span className="absolute top-2 right-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
                        {post.category}
                    </span>
                )} */}
            </div>
            <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">{formatPostDate(post.published_at)}</p>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{post.title}</p>
            </div>
        </Link>
    )
}

function formatPostDate(isoDate: string) {
    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(isoDate))
}

// ---------------------------------------------------------------------------
// Shared product tile — used by both the featured strip and the recent
// products grid so the two sections look like one visual language.
// ---------------------------------------------------------------------------
function ProductTile({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <Link
            href={`p/${item.slug}`}
            className="block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
        >
            <div className="relative aspect-3/4 w-full bg-muted">
                <Image
                    src={item.images[0]?.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 45vw, 180px"
                    draggable={false}
                    className={cn(
                        "object-cover select-none",
                        !hasStock && "brightness-90 grayscale-[0.5]"
                    )}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />

                {!hasStock && (
                    <span className="absolute top-2 right-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1 p-2.5">
                <p className="truncate text-xs font-medium">{item.title}</p>
                {/*
                  Always render this line, even with nothing to show. Real
                  out-of-stock products may come back with an empty
                  `variants` array (no price at all), and conditionally
                  skipping the paragraph in that case shortened just those
                  cards — a two-column grid then looks ragged, sold-out
                  cards visibly shorter than in-stock ones in the same row.
                  `invisible` keeps the line's height without showing
                  placeholder text.
                */}
                <p className="text-[11px] text-muted-foreground">
                    {item.variants?.[0] ? (
                        <>
                            <span className="font-semibold text-foreground">
                                {formatPrice(item.variants[0].price)}
                            </span>{" "}
                            تومان
                        </>
                    ) : (
                        <span className="invisible">—</span>
                    )}
                </p>
            </div>
        </Link>
    )
}
