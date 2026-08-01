/**
 * Auth API client.
 *
 * Authentication is session-based: the backend sets an httpOnly `sessionid`
 * cookie on successful verification, and every subsequent request just needs
 * to be sent with `credentials: "include"`. The frontend never touches the
 * session token directly.
 */
import request from "@/lib/api/client"

export interface AuthUser {
    id: number
    phone: string
    full_name: string
	avatar: string
}

/** Send a one-time password to `phone`. Required before `/auth/verify/`. */
export function requestLoginOtp(phone: string): Promise<void> {
    return request<void>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ phone }),
    })
}

/** Verify the OTP for `phone`. On success the backend sets the session cookie. */
export function verifyLoginOtp(phone: string, code: string): Promise<void> {
    return request<void>("/api/auth/verify/", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
    })
}

/** Invalidate the current session (backend clears the cookie). */
export function logout(): Promise<{ detail: string }> {
    return request<{ detail: string }>("/api/auth/logout/", {
        method: "POST",
    })
}

/**
 * Get the currently authenticated user, or throw an AuthApiError (401) if
 * there is no active session. Callers that just want to "check" the session
 * should catch and treat any error as "not logged in".
 */
export function fetchCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/me/", {
        method: "GET",
    })
}
