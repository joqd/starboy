import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPost } from "@/lib/api/post"
import { PostHeader } from "@/components/blog/post-header"
import { PostContent } from "@/components/blog/post-content"
import { RelatedProductsSection } from "@/components/blog/related-products-section"
import Footer from "@/components/layout/footer"

// ---------------------------------------------------------------------------
// /posts/{slug} — single blog post. Server component throughout (no
// interactivity needed), so the article text and its metadata are fully
// crawlable. SEO fields (title, description, canonical, OG/Twitter, robots)
// and both JSON-LD blocks (BlogPosting + BreadcrumbList) come straight from
// the backend via meta_tag / json_ld / breadcrumb_ld rather than being
// re-derived here, so the API stays the single source of truth for them.
//
// Related products: see components/blog/post-content.tsx and
// components/blog/inline-product-slot.tsx for how they're placed inside
// the article, and components/blog/related-products-section.tsx for the
// closing strip. Both currently read mock data from
// lib/api/related-products.ts — swap that one file for the real endpoint
// once it exists, nothing here needs to change.
// ---------------------------------------------------------------------------

interface PageProps {
    // Next.js 15: route params are async.
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return {}

    const { meta_tag } = post

    return {
        title: meta_tag.title,
        description: meta_tag.description,
        alternates: { canonical: meta_tag.canonical_url },
        robots: meta_tag.is_indexable ? undefined : { index: false, follow: false },
        openGraph: {
            type: "article",
            title: meta_tag.og_title,
            description: meta_tag.og_description,
            images: meta_tag.og_image ? [{ url: meta_tag.og_image }] : undefined,
            publishedTime: post.published_at,
            modifiedTime: post.updated_at,
            authors: [post.author.full_name],
        },
        twitter: {
            card:
                (meta_tag.twitter_card as "summary" | "summary_large_image") ??
                "summary_large_image",
            title: meta_tag.og_title,
            description: meta_tag.og_description,
            images: meta_tag.og_image ? [meta_tag.og_image] : undefined,
        },
    }
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) notFound()

    return (
        <main dir="rtl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(post.json_ld) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(post.breadcrumb_ld) }}
            />

            <article className="mx-auto mt-17.5 max-w-2xl px-6 py-6">
                <PostHeader post={post} />
                <div className="mt-6">
                    <PostContent content={post.content_html} postSlug={post.slug} />
                </div>
                {/* <RelatedProductsSection postSlug={post.slug} /> */}
            </article>

            <Footer />
        </main>
    )
}
