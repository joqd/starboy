import Image from "next/image"
import Link from "next/link"
import type { PostList } from "@/types/post"
import { cn, formatPostDate } from "@/lib/utils"

// ---------------------------------------------------------------------------
// PostCard — pulled out of blog-page.tsx so it can be reused anywhere a
// post grid shows up (blog listing, "related posts", search results, etc.)
// without copy-pasting the markup.
//
// Hover fix: the old title used a background-image underline trick
// (bg-linear-to-r ... bg-left-bottom) to animate an underline in on hover.
// Two problems with that in this RTL context: `bg-left-bottom` always grows
// from the left regardless of `dir`, so in RTL it visibly grew from the
// wrong side; and a background-image "underline" sits at a fixed pixel
// offset that doesn't track Persian glyphs the way a real text-decoration
// line would, so it never quite lined up with the script's baseline.
//
// Replaced with a small chevron that fades and slides into place next to
// the title on hover — no underline at all, so neither problem can happen,
// and it doubles as a "this opens something" affordance. It's pure CSS
// (group-hover + transitions), so this stays a plain server component with
// no client-side JS needed for the effect.
//
// PostList["results"][number] is used instead of a `PostListItem` import
// since post.ts only exports `PostList` and `Post`, not the item type.
// ---------------------------------------------------------------------------

export type PostCardItem = PostList["results"][number]

interface PostCardProps {
    post: PostCardItem
    eager?: boolean
}

export function PostCard({ post, eager = false }: PostCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {post.featured_image ? (
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading={eager ? "eager" : "lazy"}
                        fetchPriority={eager ? "high" : "auto"}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        بدون تصویر
                    </div>
                )}

                {post.category && (
                    <span className="absolute top-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur-sm">
                        {post.category}
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">{formatPostDate(post.published_at)}</p>

                <p className="flex items-center gap-1.5 text-lg leading-snug font-semibold text-foreground">
                    <span className="line-clamp-2">{post.title}</span>
                    <ChevronIcon
                        className={cn(
                            "size-3.5 shrink-0 translate-x-1 opacity-0",
                            "transition-all duration-300 ease-out",
                            "group-hover:translate-x-0 group-hover:opacity-100"
                        )}
                    />
                </p>

                {post.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                    </p>
                )}
            </div>
        </Link>
    )
}

function ChevronIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
            <path
                d="M10 3 4 8l6 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
