import Image from "next/image"
import Link from "next/link"
import { HeroImage } from "@/components/layout/hero-image"
import type { ProductListItem } from "@/types/product"
import type { LatestPost } from "@/hooks/use-posts"
import type { CollectionListItem } from "@/types/collection"
import { cn, formatPrice } from "@/lib/utils"
import { Reveal } from "./scroll-reveal"
import { ArrowIcon, TruckIcon, ShieldIcon, RefreshIcon, HeadsetIcon } from "./home-icons"
import Footer from "./footer"
import { PostCard } from "../blog/post-card"

// ---------------------------------------------------------------------------
// Desktop home page (lg and up) — v2. Reworked after the first pass ran too
// big: hero was a full-bleed viewport image, collections were an oversized
// mosaic, and the whole page felt like a product-listing page rather than a
// storefront's front door. This version:
//   - runs the whole page inside one narrow rail (max-w-[1180px]) instead
//     of a near-full-width 1600px canvas, with a lot more vertical air
//     between sections (mt-24 / mt-32) so nothing competes for attention.
//   - drops the full-viewport hero for a modest, contained split layout —
//     copy + a moderate, capped-height image, not a banner.
//   - leads with the BRAND, not the catalogue: a trust bar (icons + short
//     claims) right under the hero, then a short manifesto section, before
//     any products appear at all.
//   - treats the product sections as a taste, not the catalogue — /p is
//     a fully separate page, so featured/recent here are capped small,
//     uniform, and quiet rather than trying to be the store.
//
// FLOATING MENU CLEARANCE: the site nav is a floating control fixed to the
// bottom-right of the viewport. Because nothing here is full-bleed or
// viewport-height anymore, there's no section where content could end up
// pinned under that corner — the narrow centered rail naturally keeps clear
// of it. If a future section reintroduces a full-width/full-height block,
// re-check that its bottom-right corner has room the way the old hero did.
// ---------------------------------------------------------------------------

interface DesktopHomeProps {
    recentProducts: ProductListItem[]
    recentPosts: LatestPost[]
    featuredProducts: ProductListItem[]
    collections: CollectionListItem[]
    className?: string
}

export default function DesktopHome({
    recentProducts,
    featuredProducts,
    recentPosts,
    collections,
    className = "",
}: DesktopHomeProps) {
    return (
        <div className={cn("overflow-x-hidden", className)}>
            <DesktopHero />
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
// Section header — quieter than v1: smaller type, thinner rule. The page's
// loudest moment is the hero headline and the manifesto line; every section
// header after that is deliberately just a label, not another statement.
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
        <div className="flex items-end justify-between gap-8 border-b border-border pb-5">
            <div>
                <p className="text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            </div>
            {href && (
                <Link
                    href={href}
                    className="group flex shrink-0 items-center gap-2 pb-1 text-sm font-medium text-foreground"
                >
                    <span className="border-b border-transparent transition-colors group-hover:border-foreground">
                        مشاهده همه
                    </span>
                    <ArrowIcon className="size-3.5 transition-transform group-hover:-translate-x-1" />
                </Link>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Hero — a contained editorial split, not a banner. Copy on one side, a
// capped-height image on the other (max-w-[440px], aspect-4/5), sitting
// inside the same narrow rail as the rest of the page. Three small stats
// under the CTA start the brand-over-product framing immediately.
// ---------------------------------------------------------------------------
function DesktopHero() {
    return (
        <section className="mx-auto max-w-295 px-8 pt-20 xl:px-10">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <Reveal>
                    <p className="text-xs tracking-[0.35em] text-muted-foreground uppercase">
                        کالکشن جدید
                    </p>
                    <h1 className="mt-5 text-5xl leading-[1.15] font-bold tracking-tight text-foreground xl:text-[3.25rem]">
                        استایل خودت رو بساز
                    </h1>
                    <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                        هر تکه از این کالکشن، روایتی از سلیقه‌ی توست؛ طراحی‌شده برای کسی که سبک خودش
                        رو داره.
                    </p>
                    <Link
                        href="/p"
                        className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02]"
                    >
                        مشاهده فروشگاه
                        <ArrowIcon className="size-3.5 transition-transform group-hover:-translate-x-1" />
                    </Link>

                    <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
                        <div>
                            <dt className="text-xs text-muted-foreground">تجربه</dt>
                            <dd className="mt-1 text-lg font-semibold text-foreground">+۸ سال</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">تولید</dt>
                            <dd className="mt-1 text-lg font-semibold text-foreground">محدود</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">طراحی</dt>
                            <dd className="mt-1 text-lg font-semibold text-foreground">داخلی</dd>
                        </div>
                    </dl>
                </Reveal>

                <Reveal
                    delay={120}
                    className="relative aspect-4/5 w-full max-w-110 justify-self-center overflow-hidden rounded-[1.75rem] lg:justify-self-end"
                >
                    <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                        <HeroImage />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                </Reveal>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand values — a quiet trust bar: four short claims, each with a small
// line icon. This is the first explicitly "brand, not product" beat on the
// page, and it's intentionally plain-spoken rather than decorative.
// ---------------------------------------------------------------------------
function BrandValues() {
    const items: { icon: typeof TruckIcon; title: string; desc: string }[] = [
        { icon: TruckIcon, title: "ارسال سریع", desc: "به سراسر کشور" },
        { icon: ShieldIcon, title: "ضمانت اصالت", desc: "روی تمام محصولات" },
        { icon: RefreshIcon, title: "۷ روز مهلت", desc: "بازگشت و تعویض آسان" },
        { icon: HeadsetIcon, title: "پشتیبانی پاسخگو", desc: "هر روز هفته" },
    ]

    return (
        <section className="mx-auto mt-24 max-w-295 px-8 xl:px-10">
            <Reveal>
                <ul
                    role="list"
                    className="grid grid-cols-2 gap-y-8 border-y border-border py-8 sm:grid-cols-4"
                >
                    {items.map(({ icon: Icon, title, desc }) => (
                        <li key={title} className="flex items-center gap-3">
                            <Icon className="size-5 shrink-0 text-foreground" />
                            <div>
                                <p className="text-sm font-medium text-foreground">{title}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Reveal>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand story — a short manifesto instead of another product rail. Pure
// typography, no imagery: this is where someone learns what the brand
// actually values before they're shown anything to buy.
// ---------------------------------------------------------------------------
function BrandStory() {
    return (
        <section className="mx-auto mt-28 max-w-215 px-8 text-center xl:px-10">
            <Reveal>
                <p className="text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
                    چرا ما
                </p>
                <p className="mt-6 text-3xl leading-[1.55] font-bold tracking-tight text-foreground xl:text-4xl">
                    ما پوشاک نمی‌فروشیم؛ تکه‌هایی می‌سازیم که با کیفیت، سال‌ها کنارت می‌مونن.
                </p>
            </Reveal>
            <Reveal delay={100}>
                <ul
                    role="list"
                    className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:text-center"
                >
                    <li>
                        <p className="text-sm font-semibold text-foreground">مواد اولیه منتخب</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            پارچه و دوخت هر محصول با دقت انتخاب و کنترل می‌شه.
                        </p>
                    </li>
                    <li>
                        <p className="text-sm font-semibold text-foreground">تولید محدود</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            هر فصل در تیراژ کم، برای کیفیت و توجه بیشتر به جزئیات.
                        </p>
                    </li>
                    <li>
                        <p className="text-sm font-semibold text-foreground">طراحی داخل کشور</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            از ایده تا برش و دوخت، همه‌چیز همین‌جا شکل می‌گیره.
                        </p>
                    </li>
                </ul>
            </Reveal>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Featured — a uniform, capped-at-four grid now (no oversized lead card).
// The first item carries a small "پرفروش" label instead of extra size, so
// hierarchy reads as a claim in text, not as a bigger picture.
// ---------------------------------------------------------------------------
function FeaturedSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    const featured = items.slice(0, 4)

    return (
        <section className="mx-auto mt-28 max-w-295 px-8 xl:px-10">
            <SectionHeader eyebrow="ویترین" title="محصولات ویژه" href="/p" />
            <ul role="list" className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {featured.map((item, idx) => (
                    <Reveal key={item.slug} as="li" delay={idx * 70}>
                        <ProductTile
                            item={item}
                            eager={idx < 2}
                            badge={idx === 0 ? "پرفروش" : undefined}
                        />
                    </Reveal>
                ))}
            </ul>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Collections — a plain, evenly-sized grid, capped at four. No more
// full-bleed lead tile: every card is the same modest size, so the section
// reads as an index into the brand's world rather than a poster wall.
// ---------------------------------------------------------------------------
function CollectionsSection({ items }: { items: CollectionListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mx-auto mt-28 max-w-295 px-8 xl:px-10">
            <SectionHeader eyebrow="دنیای برند" title="کالکشن‌ها" />
            <ul role="list" className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {items.slice(0, 4).map((item, idx) => (
                    <Reveal key={item.slug} as="li" delay={idx * 70}>
                        <CollectionCard item={item} />
                    </Reveal>
                ))}
            </ul>
        </section>
    )
}

function CollectionCard({ item }: { item: CollectionListItem }) {
    if (!item.image && !item.image_dark) return null

    return (
        <Link
            href={`/collections/${item.slug}`}
            className="group relative block aspect-4/5 overflow-hidden rounded-xl"
        >
            {item.image && (
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="280px"
                    className={cn(
                        "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                        item.image_dark && "dark:hidden"
                    )}
                    loading="lazy"
                />
            )}
            {item.image_dark && (
                <Image
                    src={item.image_dark}
                    alt={item.title}
                    fill
                    sizes="280px"
                    className={cn(
                        "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                        item.image && "hidden dark:block"
                    )}
                    loading="lazy"
                />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold text-neutral-50">{item.title}</p>
            </div>
        </Link>
    )
}

// ---------------------------------------------------------------------------
// Recent products — capped at four, same quiet grid as Featured. This is a
// taste of what's new, not an attempt to duplicate /p.
// ---------------------------------------------------------------------------
function RecentProductsSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    const recent = items.slice(0, 4)

    return (
        <section className="mx-auto mt-28 max-w-295 px-8 xl:px-10">
            <SectionHeader eyebrow="تازه‌ترین‌ها" title="جدیدترین محصولات" href="/p" />
            <ul role="list" className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {recent.map((item, idx) => (
                    <Reveal key={item.slug} as="li" delay={idx * 70}>
                        <ProductTile item={item} eager={idx < 2} />
                    </Reveal>
                ))}
            </ul>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Posts — three quiet cards, same narrow rail, more air between them.
// ---------------------------------------------------------------------------
function PostsSection({ items }: { items: LatestPost[] }) {
    if (items.length === 0) return null

    return (
        <section className="mx-auto mt-28 mb-32 max-w-295 px-8 xl:px-10">
            <SectionHeader eyebrow="مجله" title="آخرین مطالب" href="/blog" />
            <ul role="list" className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
                {items.slice(0, 3).map((post, idx) => (
                    <Reveal key={post.slug} as="li" delay={idx * 90}>
                        <PostCard post={post} eager={idx < 3} />
                    </Reveal>
                ))}
            </ul>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Shared product tile — one modest size used everywhere now (the oversized
// "lg" variant from v1 is gone). Optional `badge` puts a short text label
// in the corner instead of ever making the card itself bigger.
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
            className="group block overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
        >
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                <Image
                    src={item.images[0]?.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1280px) 25vw, 280px"
                    draggable={false}
                    className={cn(
                        "object-cover transition-transform duration-700 ease-out select-none group-hover:scale-[1.04]",
                        !hasStock && "brightness-90 grayscale-[0.5]"
                    )}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />

                {badge && (
                    <span className="absolute top-3 right-3 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background">
                        {badge}
                    </span>
                )}

                {!hasStock && (
                    <span className="absolute top-3 left-3 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1.5 p-3">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {/* Always rendered, even with nothing to show — see mobile-home.tsx
                    for why: keeps out-of-stock cards the same height as the rest. */}
                <p className="text-xs text-muted-foreground">
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
