import Image from "next/image"
import Link from "next/link"
import { getProducts } from "@/lib/api/product"
import type { ProductListItem } from "@/types/product"
import { cn, formatPrice } from "@/lib/utils"
import { PageContainer } from "@/components/layout/page-container"

// ---------------------------------------------------------------------------
// Products page — plain, filter-free product listing. Width/top-spacing now
// comes from PageContainer (shared with the blog page and any other
// top-level page) instead of being hand-written here — this is also what
// fixes the width mismatch: the old version put horizontal padding on the
// inner <section>s instead of <main>, with different breakpoints than the
// blog page used.
// ---------------------------------------------------------------------------

const PAGE_SIZE = 16
const ORDERING = "-created_at"

interface ProductsPageProps {
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
        <PageContainer className="pb-16">
            <section>
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

            <section className="mt-8">
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
        </PageContainer>
    )
}

// ---------------------------------------------------------------------------
// Product card — image, title, price. Nothing else.
//
// `item.images?.[0]?.image` guards against products with no `images` array;
// a product with no photo just gets a plain muted placeholder.
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
        <div className="mt-10 flex items-center justify-center gap-3">
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
        <div className="py-24 text-center">
            <p className="text-sm font-medium text-foreground">فعلاً محصولی موجود نیست</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
                به‌زودی محصولات جدید اینجا نمایش داده می‌شن.
            </p>
        </div>
    )
}
