"use client"

import { useCallback, useState } from "react"
import { toast } from "@/components/ui/toast"
import { useCart } from "@/hooks/use-cart"

/**
 * Wraps a logout action with loading state and error feedback.
 *
 * Also resets the shared cart cache on success: the cart is tied to the
 * session cookie, so once the backend session ends, the in-memory cart
 * from useCart() is stale and has to be dropped — otherwise the previous
 * user's items keep showing everywhere until a hard refresh.
 */
export function useLogout(onLogout: () => Promise<void>) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { resetCart } = useCart()

    const logout = useCallback(async () => {
        setIsLoggingOut(true)
        try {
            await onLogout()
            resetCart()
        } catch {
            toast.add({
                type: "error",
                description: "خروج از حساب انجام نشد. دوباره تلاش کنید.",
            })
            setIsLoggingOut(false)
        }
    }, [onLogout, resetCart])

    return { logout, isLoggingOut }
}
