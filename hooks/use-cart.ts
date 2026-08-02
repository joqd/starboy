import useSWR from "swr"
import { getCart, addItemToCart, updateCartItemQuantity, RemoveItemFromCart } from "@/lib/api/cart"

export function useCart() {
    const { data, error, isLoading, mutate } = useSWR("cart", getCart)

    return {
        cart: data,
        error,
        isLoading,

        addItem: async (sku: string, quantity = 1) => {
            const cart = await addItemToCart(sku, quantity)

            mutate(cart, false)

            return cart
        },

        updateItem: async (sku: string, quantity: number) => {
            const cart = await updateCartItemQuantity(sku, quantity)

            mutate(cart, false)

            return cart
        },

        removeItem: async (sku: string) => {
            const cart = await RemoveItemFromCart(sku)

            mutate(cart, false)

            return cart
        },
    }
}
