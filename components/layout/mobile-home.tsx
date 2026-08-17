import Image from "next/image"
import Link from "next/link"
import { HeroImage } from "@/components/layout/hero-image"
import type { ProductListItem } from "@/types/product"
import type { LatestPost } from "@/hooks/use-posts"
import type { CollectionListItem } from "@/types/collection"
import { cn, formatPostDate, formatPrice } from "@/lib/utils"
import { Reveal } from "./scroll-reveal"
import { ArrowIcon, TruckIcon, ShieldIcon, RefreshIcon, HeadsetIcon } from "./home-icons"
import Footer from "./footer"
import { PostCard } from "../blog/post-card"

// ---------------------------------------------------------------------------
// Mobile home page — v2, rebuilt to match the desktop redesign: brand
// before catalogue, more air between sections, and product rails treated
// as a taste rather than an attempt to replicate /p (which is a fully
// separate page).
//
// Still a plain server component tree — no client JS beyond <Reveal>
// (IntersectionObserver only, see ./scroll-reveal), no per-frame work.
// Horizontal scroll-snap strips stay for Featured/Collections/Posts since
// swipe is the natural mobile pattern for a rail — unlike desktop, which
// had the width to lay them out as grids instead.
//
// Sections: hero -> brand values -> brand story -> featured -> collections
// -> recent products -> recent posts. Featured/collections still use mock
// data (see @/lib/mock/home-mock-data) since those endpoints don't exist
// yet; recent products and recent posts use whatever the caller already
// fetched for real (see page.tsx: getLatestProducts / getLatestPosts).
// ---------------------------------------------------------------------------

interface MobileHomeProps {
    recentProducts: ProductListItem[]
    recentPosts: LatestPost[]
    featuredProducts: ProductListItem[]
    collections: CollectionListItem[]
    className?: string
}

export default function MobileHome({
    recentProducts,
    featuredProducts,
    recentPosts,
    collections,
    className = "",
}: MobileHomeProps) {
    return (
        // overflow-x-hidden here is a defensive backstop, not the fix for
        // the horizontal-scroll bug itself — that was <main>'s w-screen in
        // page.tsx (100vw doesn't subtract the scrollbar's width). Keeping
        // this too means a future child that overflows its container
        // slightly won't reopen the same page-level scroll.
        <div className={cn("overflow-x-hidden", className)}>
            <MobileHero />
            <BrandValues />
            <BrandStory />
            <FeaturedSection items={featuredProducts} />
            <CollectionsSection items={collections} />
            <RecentProductsSection items={recentProducts} />
            <PostsSection items={recentPosts} />
            <Footer />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Shared section header: eyebrow + title + optional "view all" link. Sized
// down from v1 (smaller eyebrow, tighter title) so section headers read as
// labels, not as competing headlines — the hero and the manifesto line are
// the only two loud moments on the page now.
// ---------------------------------------------------------------------------
function SectionHeader({
    eyebrow,
    title,
    href,
}: {
    eyebrow: string
    title: string
    href?: string
}) {
    return (
        <div className="mb-4 flex items-end justify-between px-5">
            <div>
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{title}</h2>
            </div>
            {href && (
                <Link
                    href={href}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
                >
                    مشاهده همه
                    <ArrowIcon className="size-3" />
                </Link>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Hero — kept as a contained rounded panel (this was never the oversized
// element on mobile; the desktop full-bleed banner was). Copy trimmed to
// match the desktop hero's voice: eyebrow, headline, one short line.
// ---------------------------------------------------------------------------
function MobileHero() {
    return (
        <section className="relative mx-5 mt-5 aspect-4/5 overflow-hidden rounded-[1.75rem]">
            <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                <HeroImage />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-neutral-50">
                <p className="text-xs tracking-[0.25em] uppercase opacity-80">کالکشن جدید</p>
                <h1 className="mt-2 text-[1.75rem] leading-tight font-bold">استایل خودت رو بساز</h1>
                <p className="mt-2 max-w-[26ch] text-xs leading-relaxed text-neutral-200">
                    هر تکه، روایتی از سلیقه‌ی توست.
                </p>
                <Link
                    href="/p"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2.5 text-xs font-semibold text-neutral-900"
                >
                    مشاهده فروشگاه
                </Link>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand values — a quiet 2x2 trust bar, same four claims as desktop. This
// is the first "brand, not product" beat on the page, right after the hero
// and before anything is for sale.
// ---------------------------------------------------------------------------
function BrandValues() {
    const items: { icon: typeof TruckIcon; title: string; desc: string }[] = [
        { icon: TruckIcon, title: "ارسال سریع", desc: "سراسر کشور" },
        { icon: ShieldIcon, title: "ضمانت اصالت", desc: "تمام محصولات" },
        { icon: RefreshIcon, title: "۷ روز مهلت", desc: "بازگشت آسان" },
        { icon: HeadsetIcon, title: "پشتیبانی", desc: "پاسخگوی همیشگی" },
    ]

    return (
        <section className="mt-9 px-5">
            <Reveal>
                <ul role="list" className="grid grid-cols-2 gap-y-5 border-y border-border py-6">
                    {items.map(({ icon: Icon, title, desc }) => (
                        <li key={title} className="flex items-center gap-2.5">
                            <Icon className="size-4.5 shrink-0 text-foreground" />
                            <div>
                                <p className="text-xs font-medium text-foreground">{title}</p>
                                <p className="text-[11px] text-muted-foreground">{desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Reveal>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand story — a short manifesto, pure typography. Same voice as the
// desktop version, sized down for a phone screen.
// ---------------------------------------------------------------------------
function BrandStory() {
    return (
        <section className="mt-10 px-6 text-center">
            <Reveal>
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    چرا ما
                </p>
                <p className="mt-4 text-xl leading-[1.6] font-bold tracking-tight text-foreground">
                    ما پوشاک نمی‌فروشیم؛ تکه‌هایی می‌سازیم که با کیفیت، سال‌ها کنارت می‌مونن.
                </p>
            </Reveal>
            <Reveal delay={100}>
                <ul role="list" className="mt-8 grid grid-cols-1 gap-6">
                    <li>
                        <p className="text-xs font-semibold text-foreground">مواد اولیه منتخب</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            پارچه و دوخت هر محصول با دقت انتخاب و کنترل می‌شه.
                        </p>
                    </li>
                    <li>
                        <p className="text-xs font-semibold text-foreground">تولید محدود</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            هر فصل در تیراژ کم، برای کیفیت و توجه بیشتر به جزئیات.
                        </p>
                    </li>
                    <li>
                        <p className="text-xs font-semibold text-foreground">طراحی داخل کشور</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            از ایده تا برش و دوخت، همه‌چیز همین‌جا شکل می‌گیره.
                        </p>
                    </li>
                </ul>
            </Reveal>
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
                "flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1",
                "scroll-px-5 overscroll-x-contain",
                "scrollbar-none [&::-webkit-scrollbar]:hidden"
            )}
        >
            {children}
        </ul>
    )
}

// Capped at four — /p is the catalogue; this is a taste, and the first
// card carries a small text badge instead of ever being drawn bigger.
function FeaturedSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    const featured = items.slice(0, 6)

    return (
        <section className="mt-14">
            <SectionHeader eyebrow="ویترین" title="محصولات ویژه" href="/p" />
            <ScrollStrip>
                {featured.map((item, idx) => (
                    <li key={item.slug} className="w-36 shrink-0 snap-start">
                        <Reveal delay={idx * 60}>
                            <ProductTile
                                item={item}
                                eager={idx < 2}
                                badge={idx === 0 ? "پرفروش" : undefined}
                            />
                        </Reveal>
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

function CollectionsSection({ items }: { items: CollectionListItem[] }) {
    if (items.length === 0) return null

    const shown = items.slice(0, 6)

    const renderImage = (collection: CollectionListItem) => {
        if (!collection.image && !collection.image_dark) return null

        return (
            <>
                {collection.image && (
                    <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        sizes="150px"
                        className={
                            collection.image_dark ? "object-cover dark:hidden" : "object-cover"
                        }
                        loading={"eager"}
                    />
                )}

                {collection.image_dark && (
                    <Image
                        src={collection.image_dark}
                        alt={collection.title}
                        fill
                        sizes="150px"
                        className={
                            collection.image ? "hidden object-cover dark:block" : "object-cover"
                        }
                        loading={"eager"}
                    />
                )}
            </>
        )
    }

    return (
        <section className="mt-14">
            <SectionHeader eyebrow="دنیای برند" title="کالکشن‌ها" />

            <ScrollStrip>
                {shown.map((collection, idx) => (
                    <li key={collection.slug} className="w-32 shrink-0 snap-start">
                        <Reveal delay={idx * 60}>
                            <Link
                                href={`/collections/${collection.slug}`}
                                className="relative block aspect-4/5 overflow-hidden rounded-xl"
                            >
                                {renderImage(collection)}

                                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-2.5 text-neutral-50">
                                    <p className="text-xs font-semibold">{collection.title}</p>
                                </div>
                            </Link>
                        </Reveal>
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

// Capped at four for the same reason as Featured — a taste, not the catalogue.
function RecentProductsSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    const recent = items.slice(0, 4)

    return (
        <section className="mt-14">
            <SectionHeader eyebrow="تازه‌ترین‌ها" title="جدیدترین محصولات" href="/p" />
            <ul role="list" className="grid grid-cols-2 gap-3 px-5">
                {recent.map((item, idx) => (
                    <li key={item.slug}>
                        <Reveal delay={(idx % 2) * 60}>
                            <ProductTile item={item} eager={idx < 2} />
                        </Reveal>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function PostsSection({ items }: { items: LatestPost[] }) {
    if (items.length === 0) return null

    const posts = items.slice(0, 4)

    return (
        <section className="mt-14 mb-16">
            <SectionHeader eyebrow="مجله" title="آخرین مطالب" href="/blog" />
            <ScrollStrip>
                {posts.map((post, idx) => (
                    <li key={post.slug} className="w-56 shrink-0 snap-start">
                        <Reveal delay={idx * 60}>
                            <PostCard post={post} eager={idx < 2} />
                        </Reveal>
                    </li>
                ))}
            </ScrollStrip>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Shared product tile — used by both the featured strip and the recent
// products grid so the two sections look like one visual language.
// Optional `badge` puts a short text label in the corner (used once, by
// Featured's first card) instead of ever making a card bigger.
// ---------------------------------------------------------------------------
function ProductTile({
    item,
    eager,
    badge,
}: {
    item: ProductListItem
    eager: boolean
    badge?: string
}) {
    const hasStock = item.variants?.some((variant) => variant.stock > 0)

    return (
        <Link
            href={`p/${item.slug}`}
            className="block overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
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

                {badge && (
                    <span className="absolute top-2 right-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                        {badge}
                    </span>
                )}

                {!hasStock && (
                    <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
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
