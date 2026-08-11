const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

let csrfPromise: Promise<void> | null = null

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null

    const cookies = document.cookie.split("; ")

    for (const cookie of cookies) {
        const [key, value] = cookie.split("=")
        if (key === name) {
            return decodeURIComponent(value)
        }
    }

    return null
}

async function ensureCsrfCookie() {
    if (getCookie("csrftoken")) {
        return
    }

    if (!csrfPromise) {
        csrfPromise = fetch(`${API_BASE_URL}/auth/csrf/`, {
            credentials: "include",
        }).then(() => {
            csrfPromise = null
        })
    }

    return csrfPromise
}

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = "AuthApiError"
        this.status = status
    }
}

type RequestConfig = {
    auth?: boolean
}

export default async function request<T>(
    path: string,
    options: RequestInit = {},
    config: RequestConfig = {}
): Promise<T> {
    const { auth = false } = config
    const method = options.method?.toUpperCase() ?? "GET"

    const headers = new Headers(options.headers)

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json")
    }

    if (auth && !["GET", "HEAD", "OPTIONS"].includes(method)) {
        await ensureCsrfCookie()

        const csrfToken = getCookie("csrftoken")

        if (csrfToken) {
            headers.set("X-CSRFToken", csrfToken)
        }
    }

    let response: Response

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            credentials: auth ? "include" : "omit",
            headers,
        })
    } catch {
        throw new ApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.", 0)
    }

    if (!response.ok) {
        let detail = "خطایی رخ داد. دوباره تلاش کنید."

        try {
            const data = await response.json()

            if (typeof data?.detail === "string" && data.detail.trim()) {
                detail = data.detail
            }
        } catch {}

        throw new ApiError(detail, response.status)
    }

    if (response.status === 204) {
        return undefined as T
    }

    const contentLength = response.headers.get("content-length")

    if (contentLength === "0") {
        return undefined as T
    }

    return (await response.json()) as T
}
