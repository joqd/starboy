import request from "@/lib/api/client"
import type { User } from "@/types/user"

export function requestLoginOtp(phone: string): Promise<void> {
    return request<void>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ phone }),
    })
}

export function verifyLoginOtp(phone: string, code: string): Promise<void> {
    return request<void>("/api/auth/verify/", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
    })
}

export function logout(): Promise<{ detail: string }> {
    return request<{ detail: string }>("/api/auth/logout/", {
        method: "POST",
    })
}

export function fetchCurrentUser(): Promise<User> {
    return request<User>("/api/auth/me/", {
        method: "GET",
    })
}
