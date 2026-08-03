"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"

import { fetchCurrentUser, logout as logoutRequest } from "@/lib/api/auth"
import type { User } from "@/types/user"

type PendingAction = () => void

type AuthContextValue = {
    /** The current authenticated user, or null if signed out. */
    user: User | null
    /** True while the initial session check (on app load) is in flight. */
    checkingSession: boolean
    /** Whether the global login dialog is currently open. */
    isLoginOpen: boolean
    /** Raw controlled setter, wired directly into <Dialog open onOpenChange>. */
    setLoginOpen: (open: boolean) => void
    /**
     * Opens the login dialog. If `onSuccess` is provided, it will run
     * automatically right after the user completes login — e.g. so
     * "checkout" resumes without the user having to click it again.
     */
    openLogin: (onSuccess?: PendingAction) => void
    /**
     * Called by the login dialog once OTP verification succeeds. Sets the
     * user, closes the dialog, and runs (and clears) any pending action.
     */
    completeLogin: (user: User) => void
    logout: () => Promise<void>
    /**
     * Runs `action` immediately if a user is logged in. Otherwise opens the
     * login dialog and re-runs `action` automatically after a successful
     * login. Returns true if it ran immediately, false if it was deferred.
     */
    requireAuth: (action: PendingAction) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Wrap the app (root layout) with this once so any component can read the
 * current session and trigger the login dialog without prop-drilling.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [checkingSession, setCheckingSession] = useState(true)
    const [isLoginOpen, setIsLoginOpen] = useState(false)

    // Holds the action to run right after a successful login. A ref (not
    // state) because updating it should never trigger a re-render on its own.
    const pendingActionRef = useRef<PendingAction | null>(null)

    // Check for an existing session (sessionid cookie) once on mount.
    useEffect(() => {
        let cancelled = false

        fetchCurrentUser()
            .then((currentUser) => {
                if (!cancelled) setUser(currentUser)
            })
            .catch(() => {
                if (!cancelled) setUser(null)
            })
            .finally(() => {
                if (!cancelled) setCheckingSession(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const setLoginOpen = useCallback((value: boolean) => {
        // If the dialog is being dismissed without completing login, the
        // pending intent is no longer valid — drop it.
        if (!value) pendingActionRef.current = null
        setIsLoginOpen(value)
    }, [])

    const openLogin = useCallback((onSuccess?: PendingAction) => {
        pendingActionRef.current = onSuccess ?? null
        setIsLoginOpen(true)
    }, [])

    const completeLogin = useCallback((newUser: User) => {
        setUser(newUser)
        setIsLoginOpen(false)

        const action = pendingActionRef.current
        pendingActionRef.current = null
        if (action) action()
    }, [])

    const logout = useCallback(async () => {
        try {
            await logoutRequest()
        } finally {
            setUser(null)
        }
    }, [])

    const requireAuth = useCallback(
        (action: PendingAction) => {
            if (user) {
                action()
                return true
            }
            openLogin(action)
            return false
        },
        [user, openLogin]
    )

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            checkingSession,
            isLoginOpen,
            setLoginOpen,
            openLogin,
            completeLogin,
            logout,
            requireAuth,
        }),
        [
            user,
            checkingSession,
            isLoginOpen,
            setLoginOpen,
            openLogin,
            completeLogin,
            logout,
            requireAuth,
        ]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error("useAuth must be used within an <AuthProvider>")
    }
    return ctx
}
