import request from "@/lib/api/client"
import { ProductList, ProductDetail } from "@/types/product"

export function getLatestProducts(): Promise<ProductList> {
    return request<ProductList>("/api/products/", {
        method: "GET",
    })
}

export function getProduct(slug: string): Promise<ProductDetail | null> {
    return request<ProductDetail>(`/api/products/${slug}/`, {
        method: "GET",
    })
}
