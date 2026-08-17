import type { Metadata } from "next"
import Link from "next/link"
import { getLatestPosts } from "@/lib/api/post"
import { PostCard } from "@/components/blog/post-card"

// ---------------------------------------------------------------------------
// Blog index — app/blog/page.tsx. Same server-first, brand-first approach
// as the rest of the site: quiet eyebrow+title header, a plain uniform
// grid of posts (no per-card size tricks, that's the home page's job, not
// a listing page's), and pagination done via `?page=` search params so
// this stays a fully server-rendered, cacheable route with no client JS
// at all.
//
// `getLatestPosts` is assumed to take an optional page number the way it's
// called here — `getLatestPosts(pageNumber)`. If the real signature takes
// an options object instead (e.g. `getLatestPosts({ page })`), that's a
// one-line change in both generateMetadata and the page component below.
//
// PostList["results"][number] is used instead of importing a
// `PostListItem` type directly, since post.ts only exports `PostList` and
// `Post` — the per-item interface itself isn't exported.
// ---------------------------------------------------------------------------

export const revalidate = 300

interface BlogPageProps {
    searchParams: Promise<{ page?: string }>
}

function parsePage(page: string | undefined) {
    const n = Number(page)
    return Number.isFinite(n) && n > 1 ? Math.floor(n) : 1
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const pageNumber = parsePage((await searchParams).page)
    const canonical = pageNumber > 1 ? `/blog?page=${pageNumber}` : "/blog"

    return {
        title: pageNumber > 1 ? `مجله — صفحه ${pageNumber}` : "مجله",
        description: "آخرین یادداشت‌ها، راهنماها و پشت‌صحنه‌ی برند.",
        alternates: { canonical },
    }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const pageNumber = parsePage((await searchParams).page)
    const postList = await getLatestPosts(pageNumber)
    const posts = postList.results

    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: posts.map((post, idx) => ({
            "@type": "ListItem",
            position: (pageNumber - 1) * posts.length + idx + 1,
            url: `/blog/${post.slug}`,
            name: post.title,
        })),
    }

    return (
        <>
            {/* rel=prev/next: Next's Metadata API has no field for these, but
                plain <link> tags rendered anywhere in the tree get hoisted
                into <head> automatically in the app router. */}
            {pageNumber > 1 && (
                <link
                    rel="prev"
                    href={pageNumber === 2 ? "/blog" : `/blog?page=${pageNumber - 1}`}
                />
            )}
            {postList.next && <link rel="next" href={`/blog?page=${pageNumber + 1}`} />}

            {posts.length > 0 && (
                // eslint-disable-next-line react/no-danger
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
                />
            )}

            <main dir="rtl" className="mx-auto max-w-295 px-5 pt-16 pb-24 sm:px-8 xl:px-10">
                <header className="max-w-xl">
                    <p className="text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
                        مجله
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
                        یادداشت‌ها و روایت‌های برند
                    </h1>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        از پشت‌صحنه‌ی طراحی تا راهنمای نگهداری — هر چیزی که لازمه درباره‌ی دنیای ما
                        بدونی.
                    </p>
                </header>

                {posts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul
                        role="list"
                        className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {posts.map((post, idx) => (
                            <li key={post.slug}>
                                <PostCard post={post} eager={idx < 3} />
                            </li>
                        ))}
                    </ul>
                )}

                <PaginationNav
                    currentPage={pageNumber}
                    hasNext={Boolean(postList.next)}
                    hasPrevious={Boolean(postList.previous)}
                />
            </main>
        </>
    )
}

function PaginationNav({
    currentPage,
    hasNext,
    hasPrevious,
}: {
    currentPage: number
    hasNext: boolean
    hasPrevious: boolean
}) {
    if (!hasNext && !hasPrevious) return null

    return (
        <nav
            aria-label="صفحه‌بندی"
            className="mt-16 flex items-center justify-between border-t border-border pt-8"
        >
            {hasPrevious ? (
                <Link
                    href={currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`}
                    className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                    قبلی
                </Link>
            ) : (
                <span />
            )}

            <span className="text-xs text-muted-foreground tabular-nums">
                صفحه {toFa(currentPage)}
            </span>

            {hasNext ? (
                <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                    بعدی
                </Link>
            ) : (
                <span />
            )}
        </nav>
    )
}

function EmptyState() {
    return (
        <div className="mt-20 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">فعلاً یادداشتی منتشر نشده.</p>
        </div>
    )
}

const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

function toFa(n: number) {
    return String(n)
        .split("")
        .map((d) => (d >= "0" && d <= "9" ? faDigits[Number(d)] : d))
        .join("")
}
