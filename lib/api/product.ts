import request from "@/lib/api/client"
import { ProductList } from "@/types/product"

export function getLatestProducts(): Promise<ProductList> {
    return request<ProductList>("/api/products/", {
        method: "GET",
    })
}
