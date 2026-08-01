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
