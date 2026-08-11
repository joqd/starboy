interface Author {
    full_name: string
    avatar: string | null
}

interface PostListItem {
    id: number
    title: string
    slug: string
    excerpt: string
    featured: boolean
    featured_image: string | null
    category: string | null
    author: Author
    published_at: string
    view_count: number
}

export interface PostList {
    count: number
    next: string | null
    previous: string | null
    results: PostListItem[]
}

interface MetaTag {
    title: string
    description: string
    canonical_url: string
    is_indexable: boolean
    og_title: string
    og_description: string
    og_image: string | null
    twitter_card: string
}

interface JsonLdMainEntityOfPage {
    "@type": "WebPage"
    "@id": string
}

interface JsonLdAuthor {
    "@type": "Person"
}

interface JsonLdLogo {
    "@type": "ImageObject"
    url: string
}

interface JsonLdPublisher {
    "@type": "Organization"
    name: string
    logo: JsonLdLogo
}

interface JsonLd {
    "@context": "https://schema.org"
    "@type": "BlogPosting"
    headline: string
    description: string
    datePublished: string
    dateModified: string
    mainEntityOfPage: JsonLdMainEntityOfPage
    author: JsonLdAuthor
    publisher: JsonLdPublisher
}

interface BreadcrumbItem {
    "@type": "ListItem"
    position: number
    name: string
    item: string
}

interface BreadcrumbLd {
    "@context": "https://schema.org"
    "@type": "BreadcrumbList"
    itemListElement: BreadcrumbItem[]
}

export interface Post {
    id: number
    title: string
    slug: string
    excerpt: string
    content_html: string
    featured: boolean
    featured_image: string | null
    category: string | null
    author: Author
    view_count: number
    allow_comments: boolean
    media: unknown[]
    meta_tag: MetaTag
    json_ld: JsonLd
    breadcrumb_ld: BreadcrumbLd
    published_at: string
    updated_at: string
}
