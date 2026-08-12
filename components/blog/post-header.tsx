import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/types/post"
import { estimateReadingTime } from "@/lib/reading-time"

// ---------------------------------------------------------------------------
// Everything above the article body: a real (not just structured-data-only)
// breadcrumb for users and crawlers, the category/title, and a meta row
// with author, date, reading time, and view count. Kept as its own file
// since post.json_ld / breadcrumb_ld formatting logic doesn't belong mixed
// into the page's data-fetching code.
// ---------------------------------------------------------------------------
export function PostHeader({ post }: { post: Post }) {
    return (
        <header>
            <Breadcrumb items={post.breadcrumb_ld.itemListElement} />

            {post.category && (
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
                    {post.category}
                </p>
            )}

            <h1 className="text-2xl leading-tight font-bold text-foreground">{post.title}</h1>

            <div className="mt-4 flex items-center gap-3">
                {post.author.avatar ? (
                    <Image
                        src={post.author.avatar}
                        alt={post.author.full_name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {post.author.full_name.slice(0, 1)}
                    </span>
                )}

                <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{post.author.full_name}</p>
                    <p>
                        {formatFullDate(post.published_at)} ·{" "}
                        {estimateReadingTime(post.content_html)} دقیقه مطالعه
                        {/* {post.view_count.toLocaleString("fa-IR")} بازدید */}
                    </p>
                </div>
            </div>

            {post.featured_image && (
                <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 720px"
                        className="object-cover"
                        priority
                    />
                </div>
            )}
        </header>
    )
}

function Breadcrumb({ items }: { items: Post["breadcrumb_ld"]["itemListElement"] }) {
    if (items.length === 0) return null

    return (
        <nav aria-label="مسیر صفحه" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {items.map((crumb, idx) => (
                    <li key={crumb.position} className="flex items-center gap-1.5">
                        {idx > 0 && <span aria-hidden>/</span>}
                        {idx === items.length - 1 ? (
                            <span className="text-foreground">{crumb.name}</span>
                        ) : (
                            <Link href={crumb.item}>{crumb.name}</Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}

function formatFullDate(isoDate: string) {
    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(isoDate))
}
