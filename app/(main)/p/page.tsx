import Image from "next/image"
import Link from "next/link"
import { getProducts } from "@/lib/api/product"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Products page — plain, filter-free product listing. Everything lives here
// (no ProductsExplorer, no useProductFilters, no client-side fetching).
//
// This is a plain server component: the product list is fetched on the
// server for every request and rendered directly, so there's no client
// fetch/abort/race to get wrong, no loading spinner state, and no JS bundle
// shipped just to show a grid of products — page load *is* the loading
// state. Paging is done with plain ?page=N links (still server-rendered,
// no client JS needed).
//
// NOTE: adjust ORDERING below to whatever /api/products/ accepts as the
// default `ordering` value, and PAGE_SIZE to taste.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 16
const ORDERING = "-created_at"

interface ProductsPageProps {
    // Next.js (15+) passes searchParams as a Promise; awaiting a plain object
    // works too, so this is safe either way.
    searchParams: Promise<{ page?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams
    const page = Math.max(1, Number(params?.page) || 1)

    const { results: items, count } = await getProducts({
        page,
        page_size: PAGE_SIZE,
        ordering: ORDERING,
    })

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

    return (
        <main dir="rtl" className="pt-8 pb-16">
            <section className="mt-15 px-5 lg:mx-auto lg:max-w-6xl lg:px-8">
                <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                    فروشگاه
                </p>
                <div className="mt-1.5 flex items-end justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                        همه محصولات
                    </h1>
                    <span className="pb-0.5 text-xs text-muted-foreground">{count} محصول</span>
                </div>
            </section>

            <section className="mt-8 px-5 lg:mx-auto lg:max-w-6xl lg:px-8">
                {items.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul
                        role="list"
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                    >
                        {items.map((item, idx) => (
                            <li key={item.id}>
                                <ProductCard item={item} eager={idx < 4} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
        </main>
    )
}

// ---------------------------------------------------------------------------
// Product card — image, title, price. Nothing else.
//
// FIX carried over from the previous version: `item.images` can be missing
// entirely for some products. `item.images[0]` (without the `?.` on the
// index itself) throws in that case and used to crash the whole grid.
// `item.images?.[0]?.image` guards it; a product with no photo just gets a
// plain muted placeholder instead of an <Image>.
// ---------------------------------------------------------------------------
function ProductCard({ item, eager }: { item: ProductListItem; eager: boolean }) {
    const variant = item.variants?.[0]
    const hasStock = item.variants?.some((v) => v.stock > 0)
    const onSale = Boolean(variant?.compare_price && variant.compare_price > variant.price)
    const discountPct = onSale
        ? Math.round(
              (((variant!.compare_price as number) - variant!.price) /
                  (variant!.compare_price as number)) *
                  100
          )
        : null
    const cover = item.images?.[0]?.image

    return (
        <Link
            href={`/p/${item.slug}`}
            className="block overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
        >
            <div className="relative aspect-3/4 w-full bg-muted">
                {cover && (
                    <Image
                        src={cover}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        className={cn("object-cover", !hasStock && "brightness-90 grayscale-[0.5]")}
                        loading={eager ? "eager" : "lazy"}
                        fetchPriority={eager ? "high" : "auto"}
                    />
                )}

                {discountPct !== null && (
                    <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        ٪{discountPct}-
                    </span>
                )}

                {!hasStock && (
                    <span className="absolute top-2 left-2 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        ناموجود
                    </span>
                )}
            </div>

            <div className="space-y-1 p-2.5">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                    {variant ? (
                        <>
                            {onSale && (
                                <span className="ml-1 text-muted-foreground/70 line-through">
                                    {formatPrice(variant.compare_price as number)}
                                </span>
                            )}
                            <span className="font-semibold text-foreground">
                                {formatPrice(variant.price)}
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

// ---------------------------------------------------------------------------
// Pagination — plain ?page=N links, server-rendered, no client JS.
// ---------------------------------------------------------------------------
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
    const prevHref = page > 1 ? `?page=${page - 1}` : null
    const nextHref = page < totalPages ? `?page=${page + 1}` : null

    return (
        <div className="mt-10 flex items-center justify-center gap-3 px-5">
            {prevHref ? (
                <Link
                    href={prevHref}
                    className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground"
                >
                    قبلی
                </Link>
            ) : (
                <span className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground/50">
                    قبلی
                </span>
            )}

            <span className="text-xs text-muted-foreground">
                صفحه {page} از {totalPages}
            </span>

            {nextHref ? (
                <Link
                    href={nextHref}
                    className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground"
                >
                    بعدی
                </Link>
            ) : (
                <span className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground/50">
                    بعدی
                </span>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Empty state.
// ---------------------------------------------------------------------------
function EmptyState() {
    return (
        <div className="px-5 py-24 text-center">
            <p className="text-sm font-medium text-foreground">فعلاً محصولی موجود نیست</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
                به‌زودی محصولات جدید اینجا نمایش داده می‌شن.
            </p>
        </div>
    )
}
