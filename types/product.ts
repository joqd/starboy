export type ProductList = {
    count: number
    next: string | null
    previous: string | null
    results: ProductListItem[]
}

export type ProductListItem = {
    id: number
    title: string
    slug: string
    short_description: string
    featured: boolean
    published_at: string | null
    images: ProductImage[]
    variants: ProductVariant[]
    collections_list: string[]
}

export type ProductImage = {
    id: number
    image: string
    media_kind: "gallery" | string
    caption: string
    alt_text: string
    is_primary: boolean
}

export type ProductVariant = {
    id: number
    sku: string
    size: number
    size_name: string
    price: number
    compare_price: number | null
    stock: number
    is_active: boolean
}

export type ProductStatus = "draft" | "published" | "archived"

export interface ProductCollection {
    id: number
    title: string
    slug: string
    short_description: string
    image: string
    is_active: boolean
    parent: number | null
}

export interface ProductDetail {
    id: number
    title: string
    slug: string
    short_description: string
    description: string
    status: ProductStatus
    published_at: string
    featured: boolean
    collections: ProductCollection[]
    images: ProductImage[]
    variants: ProductVariant[]
    is_in_wishlist: boolean
    created_at: string
    updated_at: string
}
