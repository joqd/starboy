import request from "@/lib/api/client"
import type { Cart } from "@/types/cart"

export function getCart(): Promise<Cart> {
    return request<Cart>(
        "/api/cart/",
        {
            method: "GET",
        },
        { auth: true }
    )
}

export function addItemToCart(sku: string, quantity: number = 1): Promise<Cart> {
    return request<Cart>(
        "/api/cart/items/",
        {
            method: "POST",
            body: JSON.stringify({ sku, quantity }),
        },
        { auth: true }
    )
}

export function updateCartItemQuantity(sku: string, quantity: number): Promise<Cart> {
    return request<Cart>(
        `/api/cart/items/${sku}/`,
        {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
        },
        { auth: true }
    )
}

export function removeItemFromCart(sku: string): Promise<Cart> {
    return request<Cart>(
        `/api/cart/items/${sku}/`,
        {
            method: "DELETE",
        },
        { auth: true }
    )
}
