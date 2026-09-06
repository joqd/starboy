import Link from "next/link"
import { getProducts } from "@/lib/api/product"
import { PageContainer } from "@/components/layout/page-container"
import { ProductCard } from "@/components/product/product-card"

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
                                <ProductCard
                                    product={item}
                                    eager={idx < 4}
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                                />
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
