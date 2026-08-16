import request from "@/lib/api/client"
import type { User } from "@/types/user"

export function requestLoginOtp(phone: string): Promise<void> {
    return request<void>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ phone }),
    })
}

export function verifyLoginOtp(phone: string, code: string): Promise<void> {
    return request<void>(
        "/api/auth/verify/",
        {
            method: "POST",
            body: JSON.stringify({ phone, code }),
        },
        { auth: true }
    )
}

export function resendOtp(phone: string): Promise<void> {
    return request<void>("/api/auth/resend/", {
        method: "POST",
        body: JSON.stringify({ phone }),
    })
}

export function logout(): Promise<{ detail: string }> {
    return request<{ detail: string }>(
        "/api/auth/logout/",
        {
            method: "POST",
        },
        { auth: true }
    )
}

export function fetchCurrentUser(): Promise<User> {
    return request<User>(
        "/api/auth/me/",
        {
            method: "GET",
        },
        { auth: true }
    )
}

export function updateUserName(full_name: string): Promise<User> {
    return request<User>(
        "/api/auth/me/",
        {
            method: "PATCH",
            body: JSON.stringify({ full_name }),
        },
        { auth: true }
    )
}

export function updateUserAvatar(file: File): Promise<User> {
    const formData = new FormData()

    formData.append("avatar", file)

    return request<User>(
        "/api/auth/me/",
        {
            method: "PATCH",
            body: formData,
        },
        { auth: true }
    )
}
