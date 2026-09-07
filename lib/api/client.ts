const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const IS_DEV = process.env.NODE_ENV === "development"

let csrfPromise: Promise<void> | null = null
let requestSeq = 0

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
        devLog("csrf", "fetching csrf cookie from /auth/csrf/")
        csrfPromise = fetch(`${API_BASE_URL}/auth/csrf/`, {
            credentials: "include",
        })
            .then(() => {
                csrfPromise = null
            })
            .catch((err) => {
                csrfPromise = null
                devError("csrf", "failed to fetch csrf cookie", err)
                throw err
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

// ---------------------------------------------------------------------------
// Dev-only request logger.
//
// Every call gets a short, incrementing id (req_1, req_2, ...) so that
// overlapping/concurrent calls to the *same* endpoint (e.g. a filter or
// search box firing a new request before the previous one settled) show up
// as clearly distinct entries in the console instead of blurring together —
// which is exactly the kind of bug ("only this one page misbehaves") that's
// otherwise hard to see from a single generic error message.
//
// Everything here is gated on IS_DEV (built from NODE_ENV, which Next.js
// inlines at build time), so none of this runs — or adds any bundle-visible
// behavior — in production.
// ---------------------------------------------------------------------------

function nextRequestId(): string {
    requestSeq += 1
    return `req_${requestSeq}`
}

function headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => {
        obj[key] = value
    })
    return obj
}

function devLog(id: string, label: string, ...details: unknown[]) {
    if (!IS_DEV) return
    console.log(`%c[api:${id}] ${label}`, "color:#888", ...details)
}

function devError(id: string, label: string, ...details: unknown[]) {
    if (!IS_DEV) return
    console.error(`[api:${id}] ${label}`, ...details)
}

function logRequestStart(
    id: string,
    method: string,
    url: string,
    options: RequestInit,
    config: RequestConfig
) {
    if (!IS_DEV) return
    console.groupCollapsed(`%c[api:${id}] → ${method} ${url}`, "color:#888;font-weight:bold")
    console.log("auth:", config.auth ?? false)
    console.log("credentials:", options.credentials)
    console.log("already aborted at call time:", options.signal?.aborted ?? false)
    if (options.body !== undefined && !(options.body instanceof FormData)) {
        console.log("body:", options.body)
    }
    console.groupEnd()
    console.time(`[api:${id}] duration`)
}

// A real network-level failure: fetch() itself rejected, meaning no HTTP
// response ever came back (this is *not* a 4xx/5xx — those are handled by
// logRequestError below). Two very different situations land here and are
// easy to confuse if you only see the generic user-facing message:
//   1. The request was deliberately cancelled (AbortError) — expected and
//      harmless, e.g. a caller's AbortController firing when filters change
//      or (in dev) React Strict Mode double-invoking an effect.
//   2. Everything else — backend down at this URL, CORS still blocking this
//      specific route/method, mixed http/https, a bad path, etc.
function logNetworkFailure(id: string, method: string, url: string, err: unknown) {
    if (!IS_DEV) return
    console.timeEnd(`[api:${id}] duration`)

    const isAbort = err instanceof DOMException && err.name === "AbortError"

    console.groupCollapsed(
        `%c[api:${id}] ✗ ${method} ${url} — ${isAbort ? "aborted (cancelled, not a real failure)" : "NETWORK FAILURE"}`,
        `color:${isAbort ? "#b58900" : "#d33"};font-weight:bold`
    )
    if (isAbort) {
        console.log("raw error:", err)
    } else {
        console.error("raw error:", err)
    }
    if (err instanceof Error) {
        console.log("name:", err.name)
        console.log("message:", err.message)
    }
    if (!isAbort) {
        console.warn(
            "fetch() rejected before any HTTP response was received. Likely causes: " +
                "backend not running at this exact URL/port, CORS blocking this " +
                "specific request (check the Console tab, not just this log, for a " +
                "'blocked by CORS policy' line), mixed http/https content, or a typo'd path."
        )
    }
    console.groupEnd()
}

function logHttpError(
    id: string,
    method: string,
    url: string,
    response: Response,
    detail: string,
    body: unknown
) {
    if (!IS_DEV) return
    console.timeEnd(`[api:${id}] duration`)
    console.groupCollapsed(
        `%c[api:${id}] ✗ ${method} ${url} — ${response.status} ${response.statusText}`,
        "color:#d33;font-weight:bold"
    )
    console.log("status:", response.status, response.statusText)
    console.log("parsed detail shown to user:", detail)
    console.log("full response body:", body)
    console.log("headers:", headersToObject(response.headers))
    console.groupEnd()
}

function logSuccess(id: string, method: string, url: string, response: Response) {
    if (!IS_DEV) return
    console.timeEnd(`[api:${id}] duration`)
    console.log(`%c[api:${id}] ✓ ${method} ${url} — ${response.status}`, "color:#2a2")
}

export default async function request<T>(
    path: string,
    options: RequestInit = {},
    config: RequestConfig = {}
): Promise<T> {
    const id = nextRequestId()
    const { auth = false } = config
    const method = options.method?.toUpperCase() ?? "GET"
    const url = `${API_BASE_URL}${path}`

    const headers = new Headers(options.headers)

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json")
    }

    if (auth && !["GET", "HEAD", "OPTIONS"].includes(method)) {
        await ensureCsrfCookie()

        const csrfToken = getCookie("csrftoken")

        if (csrfToken) {
            headers.set("X-CSRFToken", csrfToken)
        } else {
            devError(
                id,
                "auth request is missing a csrftoken cookie after ensureCsrfCookie() — check /auth/csrf/"
            )
        }
    }

    const fetchOptions: RequestInit = {
        ...options,
        credentials: auth ? "include" : "omit",
        headers,
    }

    logRequestStart(id, method, url, fetchOptions, config)

    let response: Response

    try {
        response = await fetch(url, fetchOptions)
    } catch (err) {
        logNetworkFailure(id, method, url, err)

        const isAbort = err instanceof DOMException && err.name === "AbortError"
        if (isAbort) {
            // Let callers (e.g. code using AbortController for live filtering)
            // handle cancellation on their own terms instead of it masquerading
            // as a connectivity error.
            throw err
        }

        throw new ApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.", 0)
    }

    if (!response.ok) {
        let detail = "خطایی رخ داد. دوباره تلاش کنید."
        let body: unknown = null

        try {
            body = await response.clone().json()

            if (
                typeof (body as { detail?: unknown })?.detail === "string" &&
                (body as { detail: string }).detail.trim()
            ) {
                detail = (body as { detail: string }).detail
            }
        } catch (parseErr) {
            devError(id, "could not parse error response body as JSON", parseErr)
        }

        logHttpError(id, method, url, response, detail, body)
        throw new ApiError(detail, response.status)
    }

    logSuccess(id, method, url, response)

    if (response.status === 204) {
        return undefined as T
    }

    const contentLength = response.headers.get("content-length")

    if (contentLength === "0") {
        return undefined as T
    }

    return (await response.json()) as T
}
