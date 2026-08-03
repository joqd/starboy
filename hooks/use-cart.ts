"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { getCart, addItemToCart, updateCartItemQuantity, removeItemFromCart } from "@/lib/api/cart"
import type { Cart } from "@/types/cart"

type CartState = {
    cart: Cart | null
    isLoading: boolean
    error: string | null
    pendingSkus: Set<string>
}

let state: CartState = {
    cart: null,
    isLoading: false,
    error: null,
    pendingSkus: new Set(),
}

let hasFetched = false
let inFlightFetch: Promise<void> | null = null
const listeners = new Set<() => void>()

function setState(partial: Partial<CartState>) {
    state = { ...state, ...partial }
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

function getSnapshot() {
    return state
}

function setPending(sku: string, pending: boolean) {
    const next = new Set(state.pendingSkus)
    if (pending) next.add(sku)
    else next.delete(sku)
    setState({ pendingSkus: next })
}

function errorMessage(err: unknown, fallback: string) {
    return err instanceof Error && err.message ? err.message : fallback
}

async function fetchCart() {
    if (inFlightFetch) return inFlightFetch

    setState({ isLoading: true, error: null })
    inFlightFetch = getCart()
        .then((cart) => {
            setState({ cart, isLoading: false })
        })
        .catch((err) => {
            setState({
                isLoading: false,
                error: errorMessage(err, "خطا در دریافت سبد خرید"),
            })
        })
        .finally(() => {
            inFlightFetch = null
        })

    return inFlightFetch
}

async function addItem(sku: string, quantity: number) {
    setPending(sku, true)
    setState({ error: null })
    try {
        const cart = await addItemToCart(sku, quantity)
        setState({ cart })
        return cart
    } catch (err) {
        setState({ error: errorMessage(err, "افزودن به سبد خرید با خطا مواجه شد") })
        throw err
    } finally {
        setPending(sku, false)
    }
}

async function updateQuantity(sku: string, quantity: number) {
    setPending(sku, true)
    setState({ error: null })
    try {
        const cart = await updateCartItemQuantity(sku, quantity)
        setState({ cart })
        return cart
    } catch (err) {
        setState({ error: errorMessage(err, "بروزرسانی سبد خرید با خطا مواجه شد") })
        throw err
    } finally {
        setPending(sku, false)
    }
}

async function removeItem(sku: string) {
    setPending(sku, true)
    setState({ error: null })
    try {
        const cart = await removeItemFromCart(sku)
        setState({ cart })
        return cart
    } catch (err) {
        setState({ error: errorMessage(err, "حذف از سبد خرید با خطا مواجه شد") })
        throw err
    } finally {
        setPending(sku, false)
    }
}

function resetCart() {
    state = { cart: null, isLoading: false, error: null, pendingSkus: new Set() }
    inFlightFetch = null
    hasFetched = true
    listeners.forEach((listener) => listener())
    fetchCart()
}

export function useCart() {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

    useEffect(() => {
        if (!hasFetched) {
            hasFetched = true
            fetchCart()
        }
    }, [])

    const getItemQuantity = useCallback(
        (sku: string) => snapshot.cart?.items.find((item) => item.sku === sku)?.quantity ?? 0,
        [snapshot.cart]
    )

    const isPending = useCallback(
        (sku: string) => snapshot.pendingSkus.has(sku),
        [snapshot.pendingSkus]
    )

    return {
        cart: snapshot.cart,
        itemCount: snapshot.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
        isLoading: snapshot.isLoading,
        error: snapshot.error,
        addItem,
        updateQuantity,
        removeItem,
        resetCart,
        getItemQuantity,
        isPending,
        refetch: fetchCart,
    }
}
