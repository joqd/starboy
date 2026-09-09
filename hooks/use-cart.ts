"use client"

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
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

/**
 * Patches the *known* available_stock for a set of SKUs without touching
 * quantities. Meant to be called after the backend rejects an action
 * (typically order creation) because someone else bought stock out from
 * under this cart between the last fetch and now.
 *
 * We deliberately don't auto-clamp the quantity down - silently changing
 * what the user asked for is more confusing than showing a clear
 * "you asked for more than is left" state and letting them fix it. The
 * insufficient-stock condition (quantity > available_stock) is derived
 * below, so patching available_stock here is enough for the UI to light up
 * correctly everywhere it's checked.
 */
function applyStockUpdates(updates: { sku: string; available_stock: number }[]) {
    if (!state.cart || updates.length === 0) return

    const bySku = new Map(updates.map((u) => [u.sku, u.available_stock]))
    const items = state.cart.items.map((item) =>
        bySku.has(item.sku) ? { ...item, available_stock: bySku.get(item.sku)! } : item
    )

    setState({ cart: { ...state.cart, items } })
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

    // An item is "over-stock" once we know (from the initial fetch, a
    // refetch, or a stock conflict reported by the order API) that fewer
    // units are available than the user currently has in their cart.
    const outOfStockItems = useMemo(
        () => (snapshot.cart?.items ?? []).filter((item) => item.quantity > item.available_stock),
        [snapshot.cart]
    )
    const hasStockIssues = outOfStockItems.length > 0

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
        applyStockUpdates,
        outOfStockItems,
        hasStockIssues,
    }
}
