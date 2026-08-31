export interface Cart {
    id: number
    token: string
    items: CartItem[]
    total_price: number
}

export interface CartItem {
    id: number
    sku: string
    slug: string
    quantity: number
    product_title: string
    available_stock: number
    size: string
    price: number
    image: string
    compare_price: number
}
