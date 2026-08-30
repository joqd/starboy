import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

import { HeroImage } from "@/components/layout/hero-image"
import {
    ArrowIcon,
    TruckIcon,
    ShieldIcon,
    RefreshIcon,
    HeadsetIcon,
} from "@/components/layout/home-icons"
import { PostCard } from "@/components/blog/post-card"
import { cn, formatPrice } from "@/lib/utils"
import { getLatestProducts, getFeaturedProducts } from "@/lib/api/product"
import { getLatestPosts } from "@/lib/api/post"
import { getCollections } from "@/lib/api/collection"
import type { ProductListItem } from "@/types/product"
import type { LatestPost } from "@/hooks/use-posts"
import type { CollectionListItem } from "@/types/collection"

export const revalidate = 300

// ---------------------------------------------------------------------------
// Home page — single responsive tree (was previously split into a separate
// DesktopHome / MobileHome component pair, each rendering its own copy of
// nearly every section and toggled with hidden/lg:hidden). The two trees
// were ~90% identical markup with only sizing, spacing, and container type
// (grid vs. horizontal scroll-strip) differing per breakpoint, so shipping
// both meant every section's HTML (and, previously, the client-side
// <Reveal> reveal-on-scroll wrapper around each one) went down the wire
// twice on every load.
//
// This version renders each section once and switches its layout at the
// `lg` breakpoint with Tailwind variants — a plain flex scroll-strip below
// `lg`, a CSS grid at `lg` and up for Featured/Collections/Posts, just a
// column-count change for Recent products. The only section that isn't
// meaningfully unify-able is the hero: the mobile hero is a single
// image panel with overlaid copy, the desktop hero is a two-column
// split with a stats row, so those stay as two small, breakpoint-gated
// blocks rather than forcing an artificial shared structure on them.
//
// No scroll-triggered reveal animations — they added an IntersectionObserver
// client bundle and per-item wrapper components for a purely decorative
// fade-in. Sections render immediately, which is also just faster.
// ---------------------------------------------------------------------------

export default async function Home() {
    const [latestProducts, featuredProducts, latestPosts, collections] = await Promise.all([
        getLatestProducts(),
        getFeaturedProducts(),
        getLatestPosts(),
        getCollections(),
    ])

    return (
        <main dir="rtl" className="relative w-full overflow-x-hidden">
            <Hero />
            <BrandValues />
            <BrandStory />
            <FeaturedSection items={featuredProducts.results.slice(0, 4)} />
            <CollectionsSection items={collections.results} />
            <RecentProductsSection items={latestProducts.results.slice(0, 4)} />
            <PostsSection items={latestPosts.results.slice(0, 5)} />
        </main>
    )
}

// ---------------------------------------------------------------------------
// Shared section header — eyebrow + title + optional "view all" link. Sized
// and spaced for mobile by default; `lg:` variants switch it to the desktop
// treatment (bigger type, bottom rule instead of margin, hover-underline
// link) at the same breakpoint the old split components used.
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
        <div className="mb-4 flex items-end justify-between px-5 lg:mb-0 lg:gap-8 lg:border-b lg:border-border lg:px-0 lg:pb-5">
            <div>
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground lg:text-[11px] lg:tracking-[0.3em]">
                    {eyebrow}
                </p>
                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-foreground lg:mt-2 lg:text-2xl">
                    {title}
                </h2>
            </div>
            {href && (
                <Link
                    href={href}
                    className="group flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground lg:gap-2 lg:pb-1 lg:text-sm lg:text-foreground"
                >
                    <span className="lg:border-b lg:border-transparent lg:transition-colors lg:group-hover:border-foreground">
                        مشاهده همه
                    </span>
                    <ArrowIcon className="size-3 lg:size-3.5 lg:transition-transform lg:group-hover:-translate-x-1" />
                </Link>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Hero — the one section kept as two breakpoint-gated blocks instead of a
// unified tree: the mobile hero is an image panel with overlaid copy, the
// desktop hero is a two-column split with a stats row. Forcing these into
// one shared structure would cost more markup than it saves.
// ---------------------------------------------------------------------------
function Hero() {
    return (
        <>
            <MobileHero />
            <DesktopHero />
        </>
    )
}

function MobileHero() {
    return (
        <section className="relative mx-5 mt-5 aspect-4/5 overflow-hidden rounded-[1.75rem] lg:hidden">
            <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                <HeroImage />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-neutral-50">
                <p className="text-xs tracking-[0.25em] opacity-80">کالکشن جدید</p>
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

function DesktopHero() {
    return (
        <section className="mx-auto hidden max-w-295 px-8 pt-20 lg:block xl:px-10">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div>
                    <p className="text-xs tracking-[0.35em] text-muted-foreground">کالکشن جدید</p>
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
                            <dd className="mt-1 text-lg font-semibold text-foreground">+۵ سال</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">تولید</dt>
                            <dd className="mt-1 text-lg font-semibold text-foreground">محدود</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">طراحی</dt>
                            <dd className="mt-1 text-lg font-semibold text-foreground">اختصاصی</dd>
                        </div>
                    </dl>
                </div>

                <div className="relative aspect-4/5 w-full max-w-110 justify-self-center overflow-hidden rounded-[1.75rem] lg:justify-self-end">
                    <div className="absolute inset-0 *:h-full *:w-full *:object-cover">
                        <HeroImage />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand values — a quiet trust bar: four short claims, each with a small
// line icon. Copy is slightly more compact on mobile than desktop for a
// couple of the claims, so those two text nodes are rendered twice and
// toggled with lg:hidden / hidden lg:inline — everything else (icon,
// layout, spacing) is one shared tree.
// ---------------------------------------------------------------------------
type ValueItem = {
    icon: typeof TruckIcon
    title: string
    titleDesktop?: string
    desc: string
    descDesktop: string
}

function BrandValues() {
    const items: ValueItem[] = [
        { icon: TruckIcon, title: "ارسال سریع", desc: "سراسر کشور", descDesktop: "به سراسر کشور" },
        {
            icon: ShieldIcon,
            title: "ضمانت اصالت",
            desc: "تمام محصولات",
            descDesktop: "روی تمام محصولات",
        },
        {
            icon: RefreshIcon,
            title: "۷ روز مهلت",
            desc: "بازگشت آسان",
            descDesktop: "بازگشت و تعویض آسان",
        },
        {
            icon: HeadsetIcon,
            title: "پشتیبانی",
            titleDesktop: "پشتیبانی پاسخگو",
            desc: "پاسخگوی همیشگی",
            descDesktop: "هر روز هفته",
        },
    ]

    return (
        <section className="mt-9 px-5 lg:mx-auto lg:mt-24 lg:max-w-295 lg:px-8 xl:px-10">
            <ul
                role="list"
                className="grid grid-cols-2 gap-y-5 border-y border-border py-6 lg:grid-cols-4 lg:gap-y-8 lg:py-8"
            >
                {items.map(({ icon: Icon, title, titleDesktop, desc, descDesktop }) => (
                    <li key={title} className="flex items-center gap-2.5 lg:gap-3">
                        <Icon className="size-4.5 shrink-0 text-foreground lg:size-5" />
                        <div>
                            <p className="text-xs font-medium text-foreground lg:text-sm">
                                {titleDesktop ? (
                                    <>
                                        <span className="lg:hidden">{title}</span>
                                        <span className="hidden lg:inline">{titleDesktop}</span>
                                    </>
                                ) : (
                                    title
                                )}
                            </p>
                            <p className="text-[11px] text-muted-foreground lg:text-xs">
                                <span className="lg:hidden">{desc}</span>
                                <span className="hidden lg:inline">{descDesktop}</span>
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Brand story — a short manifesto, pure typography. All copy matches
// between breakpoints except one list item's title, toggled the same way
// as BrandValues above.
// ---------------------------------------------------------------------------
function BrandStory() {
    return (
        <section className="mt-10 px-6 text-center lg:mx-auto lg:mt-28 lg:max-w-215 lg:px-8 xl:px-10">
            <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground lg:text-[11px] lg:tracking-[0.3em]">
                چرا ما
            </p>
            <p className="mt-4 text-xl leading-[1.6] font-bold tracking-tight text-foreground lg:mt-6 lg:text-3xl lg:leading-[1.55] xl:text-4xl">
                ما پوشاک نمی‌فروشیم؛ تکه‌هایی می‌سازیم که با کیفیت، سال‌ها کنارت می‌مونن.
            </p>
            <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-10"
            >
                <li>
                    <p className="text-xs font-semibold text-foreground lg:text-sm">
                        مواد اولیه منتخب
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground lg:mt-2 lg:text-sm">
                        پارچه و دوخت هر محصول با دقت انتخاب و کنترل می‌شه.
                    </p>
                </li>
                <li>
                    <p className="text-xs font-semibold text-foreground lg:text-sm">تولید محدود</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground lg:mt-2 lg:text-sm">
                        هر فصل در تیراژ کم، برای کیفیت و توجه بیشتر به جزئیات.
                    </p>
                </li>
                <li>
                    <p className="text-xs font-semibold text-foreground lg:text-sm">
                        <span className="lg:hidden">طراحی داخل کشور</span>
                        <span className="hidden lg:inline">طراحی اختصاصی</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground lg:mt-2 lg:text-sm">
                        از ایده تا طرح، همه‌چیز همین‌جا شکل می‌گیره.
                    </p>
                </li>
            </ul>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Adaptive strip — a horizontal scroll-snap row below `lg` (the natural
// mobile pattern for a rail), a CSS grid at `lg` and up. Shared by
// Featured, Collections, and Posts; pass the desktop column count/gap via
// `className`, and give each <li> `lg:w-auto lg:shrink` so it drops its
// fixed scroll-strip width once the grid takes over.
// ---------------------------------------------------------------------------
function AdaptiveStrip({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <ul
            role="list"
            className={cn(
                "flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1",
                "scroll-px-5 scrollbar-none overscroll-x-contain [&::-webkit-scrollbar]:hidden",
                "lg:mt-10 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0",
                className
            )}
        >
            {children}
        </ul>
    )
}

// Capped at four — /p is the full catalogue, this is a taste. Item count
// and eagerness are identical at both breakpoints; only the strip vs. grid
// container and the tile's own sizing differ.
function FeaturedSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-14 lg:mx-auto lg:mt-28 lg:max-w-295 lg:px-8 xl:px-10">
            <SectionHeader eyebrow="ویترین" title="محصولات ویژه" href="/p" />
            <AdaptiveStrip className="lg:grid-cols-4 lg:gap-6">
                {items.map((item, idx) => (
                    <li key={item.slug} className="w-36 shrink-0 snap-start lg:w-auto lg:shrink">
                        <ProductTile
                            item={item}
                            eager={idx < 2}
                            badge={idx === 0 ? "پرفروش" : undefined}
                        />
                    </li>
                ))}
            </AdaptiveStrip>
        </section>
    )
}

// Collections show more items on mobile (up to 6, since it's a scroll
// strip) than on the capped four-tile desktop grid — items 5 and 6 are
// rendered but hidden at `lg` rather than duplicated per breakpoint.
function CollectionsSection({ items }: { items: CollectionListItem[] }) {
    if (items.length === 0) return null

    const shown = items.slice(0, 6)

    return (
        <section className="mt-14 lg:mx-auto lg:mt-28 lg:max-w-295 lg:px-8 xl:px-10">
            <SectionHeader eyebrow="دنیای استاربوی" title="کالکشن‌ها" />
            <AdaptiveStrip className="lg:grid-cols-4 lg:gap-5">
                {shown.map((collection, idx) => (
                    <li
                        key={collection.slug}
                        className={cn(
                            "w-32 shrink-0 snap-start lg:w-auto lg:shrink",
                            idx >= 4 && "lg:hidden"
                        )}
                    >
                        <CollectionCard item={collection} eager={idx < 2} />
                    </li>
                ))}
            </AdaptiveStrip>
        </section>
    )
}

function CollectionCard({ item, eager }: { item: CollectionListItem; eager: boolean }) {
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
                    sizes="(max-width: 1024px) 150px, 280px"
                    className={cn(
                        "object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105",
                        item.image_dark && "dark:hidden"
                    )}
                    loading={eager ? "eager" : "lazy"}
                />
            )}
            {item.image_dark && (
                <Image
                    src={item.image_dark}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 150px, 280px"
                    className={cn(
                        "object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105",
                        item.image && "hidden dark:block"
                    )}
                    loading={eager ? "eager" : "lazy"}
                />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent lg:from-black/60" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 text-neutral-50 lg:p-4">
                <p className="text-xs font-semibold lg:text-sm">{item.title}</p>
            </div>
        </Link>
    )
}

// Capped at four for the same reason as Featured — a taste, not the
// catalogue. Both breakpoints show the same four items, just a 2-column
// grid on mobile widening to 4 columns at `lg`.
function RecentProductsSection({ items }: { items: ProductListItem[] }) {
    if (items.length === 0) return null

    return (
        <section className="mt-14 lg:mx-auto lg:mt-28 lg:max-w-295 lg:px-8 xl:px-10">
            <SectionHeader eyebrow="تازه‌ترین‌ها" title="جدیدترین محصولات" href="/p" />
            <ul
                role="list"
                className="grid grid-cols-2 gap-3 px-5 lg:mt-10 lg:grid-cols-4 lg:gap-6 lg:px-0"
            >
                {items.map((item, idx) => (
                    <li key={item.slug}>
                        <ProductTile item={item} eager={idx < 2} />
                    </li>
                ))}
            </ul>
        </section>
    )
}

// Same idea as Collections: mobile's scroll strip shows up to four posts,
// the desktop grid caps at three — the fourth is rendered but hidden at `lg`.
function PostsSection({ items }: { items: LatestPost[] }) {
    if (items.length === 0) return null

    const posts = items.slice(0, 4)

    return (
        <section className="mt-14 mb-16 lg:mx-auto lg:mt-28 lg:mb-32 lg:max-w-295 lg:px-8 xl:px-10">
            <SectionHeader eyebrow="مجله" title="آخرین مطالب" href="/blog" />
            <AdaptiveStrip className="lg:grid-cols-3 lg:gap-10">
                {posts.map((post, idx) => (
                    <li
                        key={post.slug}
                        className={cn(
                            "w-56 shrink-0 snap-start lg:w-auto lg:shrink",
                            idx >= 3 && "lg:hidden"
                        )}
                    >
                        <PostCard post={post} eager={idx < 2} />
                    </li>
                ))}
            </AdaptiveStrip>
        </section>
    )
}

// ---------------------------------------------------------------------------
// Shared product tile — used by Featured and Recent products alike, one
// modest size that scales up slightly at `lg`. Optional `badge` puts a
// short text label in the corner instead of ever making the card bigger.
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
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 180px, (max-width: 1280px) 25vw, 280px"
                    draggable={false}
                    className={cn(
                        "object-cover select-none lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-[1.04]",
                        !hasStock && "brightness-90 grayscale-[0.5]"
                    )}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                />

                {badge && (
                    <span className="absolute top-2 right-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background lg:top-3 lg:right-3 lg:px-2.5 lg:py-1">
                        {badge}
                    </span>
                )}

                {!hasStock && (
                    <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm lg:top-3 lg:left-3 lg:px-2.5 lg:py-1 lg:text-[11px]">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1 p-2.5 lg:space-y-1.5 lg:p-3">
                <p className="truncate text-xs font-medium lg:text-sm">{item.title}</p>
                {/* Always rendered, even with nothing to show: real out-of-stock
                    products may come back with an empty `variants` array (no
                    price at all), and conditionally skipping this line would
                    make just those cards shorter — a grid row then looks
                    ragged. `invisible` keeps the line's height without
                    showing placeholder text. */}
                <p className="text-[11px] text-muted-foreground lg:text-xs">
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
