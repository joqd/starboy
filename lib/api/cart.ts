import request from "@/lib/api/client"
import type { Cart } from "@/types/cart"

export function getCart(): Promise<Cart> {
    return request<Cart>("/api/cart/", {
        method: "GET",
    })
}

export function addItemToCart(sku: string, quantity: number = 1): Promise<Cart> {
    return request<Cart>("/api/cart/items/", {
        method: "POST",
        body: JSON.stringify({ sku, quantity }),
    })
}

export function updateCartItemQuantity(sku: string, quantity: number): Promise<Cart> {
    return request<Cart>(`/api/cart/items/${sku}/`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
    })
}

export function RemoveItemFromCart(sku: string): Promise<Cart> {
    return request<Cart>(`/api/cart/items/${sku}/`, {
        method: "DELETE",
    })
}
