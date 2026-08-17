import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cn, formatPostDate } from "@/lib/utils"
import { getPost } from "@/lib/api/post"
import { CopyLinkButton } from "@/components/blog/copy-link-button"

export const revalidate = 300

interface PostPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug).catch(() => null)
    if (!post) return {}

    const { meta_tag } = post

    return {
        title: meta_tag.title,
        description: meta_tag.description,
        alternates: { canonical: meta_tag.canonical_url },
        robots: {
            index: meta_tag.is_indexable,
            follow: meta_tag.is_indexable,
        },
        openGraph: {
            type: "article",
            title: meta_tag.og_title,
            description: meta_tag.og_description,
            url: meta_tag.canonical_url,
            publishedTime: post.published_at,
            modifiedTime: post.updated_at,
            authors: [post.author.full_name],
            images: meta_tag.og_image ? [{ url: meta_tag.og_image }] : undefined,
        },
        twitter: {
            card:
                (meta_tag.twitter_card as "summary" | "summary_large_image") ||
                "summary_large_image",
            title: meta_tag.og_title,
            description: meta_tag.og_description,
            images: meta_tag.og_image ? [meta_tag.og_image] : undefined,
        },
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params
    const post = await getPost(slug).catch(() => null)

    if (!post) notFound()

    const readingMinutes = getReadingMinutes(post.content_html)

    return (
        <>
            {/* Structured data — passed through as-is from the API, which
                already owns the shape search engines expect. */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(post.json_ld) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(post.breadcrumb_ld) }}
            />

            <article dir="rtl" className="mx-auto max-w-180 px-5 pt-10 pb-24 sm:px-8">
                {/* <BreadcrumbNav items={post.breadcrumb_ld?.itemListElement} /> */}

                <header>
                    <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-4xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2.5">
                            {post.author.avatar ? (
                                <Image
                                    src={post.author.avatar}
                                    alt={post.author.full_name}
                                    width={36}
                                    height={36}
                                    className="size-9 rounded-full object-cover"
                                />
                            ) : (
                                <span
                                    aria-hidden
                                    className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                                >
                                    {post.author.full_name.slice(0, 1)}
                                </span>
                            )}
                            <span className="font-medium text-foreground">
                                {post.author.full_name}
                            </span>
                        </div>
                        <Dot />
                        <time dateTime={post.published_at}>
                            {formatPostDate(post.published_at)}
                        </time>
                        <Dot />
                        <span>{toFa(readingMinutes)} دقیقه مطالعه</span>
                        <Dot />
                        <span>{toFa(post.view_count)} بازدید</span>
                    </div>
                </header>

                {post.featured_image && (
                    <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                        <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 720px"
                            className="object-cover"
                        />
                    </div>
                )}

                {/* eslint-disable-next-line react/no-danger */}
                <div
                    className={proseClassName}
                    dangerouslySetInnerHTML={{ __html: post.content_html }}
                />

                <footer className="mt-16 flex items-center justify-between border-t border-border pt-8">
                    <Link
                        href="/blog"
                        className="group flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                        <ArrowIcon className="size-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
                        بازگشت به مجله
                    </Link>
                    <CopyLinkButton url={post.meta_tag.canonical_url} />
                </footer>
            </article>
        </>
    )
}

// ---------------------------------------------------------------------------
// Rendered breadcrumb — built from the same `breadcrumb_ld.itemListElement`
// array that's serialized into JSON-LD above, so the visible trail and the
// structured data can never drift apart from each other.
// ---------------------------------------------------------------------------
function BreadcrumbNav({ items }: { items?: { position: number; name: string; item: string }[] }) {
    if (!items?.length) return null

    return (
        <nav
            aria-label="breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
            {items
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((crumb, idx, arr) => (
                    <span key={crumb.position} className="flex items-center gap-1.5">
                        {idx > 0 && <span aria-hidden>/</span>}
                        {idx === arr.length - 1 ? (
                            <span aria-current="page" className="text-foreground">
                                {crumb.name}
                            </span>
                        ) : (
                            <a
                                href={crumb.item}
                                className="transition-colors hover:text-foreground"
                            >
                                {crumb.name}
                            </a>
                        )}
                    </span>
                ))}
        </nav>
    )
}

function Dot() {
    return (
        <span aria-hidden className="text-border">
            ·
        </span>
    )
}

function ArrowIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
            <path
                d="M12 4 4 12M4 12H11M4 12V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

function toFa(n: number) {
    return String(n)
        .split("")
        .map((d) => (d >= "0" && d <= "9" ? faDigits[Number(d)] : d))
        .join("")
}

// Rough Persian reading speed (~180 wpm) off the plain-text length of the
// rendered HTML. Good enough for a "N دقیقه مطالعه" label — not meant to be
// precise, just directionally useful the way every blog's estimate is.
function getReadingMinutes(html: string) {
    const text = html.replace(/<[^>]+>/g, " ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 180))
}

// ---------------------------------------------------------------------------
// Typography for `content_html` — hand-styled via Tailwind arbitrary child
// selectors rather than assuming @tailwindcss/typography is installed.
// Targets the flat block-level sequence a rich-text editor typically
// outputs (p / h2 / h3 / ul / ol / blockquote / img / hr as top-level
// siblings), plus `a` and `img` as descendants since those can also appear
// inline inside a paragraph.
// ---------------------------------------------------------------------------
const proseClassName = cn(
    "mt-10 text-foreground",
    "[&>p]:mt-5 [&>p]:text-[15px] [&>p]:leading-[1.9] [&>p]:text-foreground/90",
    "[&>h2]:mt-12 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-foreground",
    "[&>h3]:mt-9 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:tracking-tight [&>h3]:text-foreground",
    "[&>ul]:mt-5 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pr-5 [&>ul]:text-[15px] [&>ul]:leading-[1.9] [&>ul]:text-foreground/90",
    "[&>ol]:mt-5 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pr-5 [&>ol]:text-[15px] [&>ol]:leading-[1.9] [&>ol]:text-foreground/90",
    "[&>blockquote]:mt-8 [&>blockquote]:border-r-2 [&>blockquote]:border-foreground [&>blockquote]:pr-5 [&>blockquote]:text-lg [&>blockquote]:leading-relaxed [&>blockquote]:text-muted-foreground [&>blockquote]:italic",
    "[&>img]:mt-8 [&>img]:w-full [&>img]:rounded-2xl",
    "[&>figure]:mt-8 [&>figure_figcaption]:mt-2 [&>figure_figcaption]:text-center [&>figure_figcaption]:text-xs [&>figure_figcaption]:text-muted-foreground [&>figure_img]:w-full [&>figure_img]:rounded-2xl",
    "[&>hr]:my-12 [&>hr]:border-border",
    "[&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-foreground",
    "[&_strong]:font-semibold [&_strong]:text-foreground"
)
