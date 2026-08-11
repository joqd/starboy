"use client"

import { useCallback, useEffect, useState } from "react"
import { getLatestPosts, getPost } from "@/lib/api/post"
import type { Post, PostList } from "@/types/post"

// PostListItem isn't exported from "@/types/post" on its own, so we derive
// it from PostList instead of touching that file just for a type export.
export type LatestPost = PostList["results"][number]

interface UseLatestPostsResult {
    posts: LatestPost[]
    count: number
    isLoading: boolean
    error: Error | null
    refetch: () => void
}

/**
 * Client-side hook around `getLatestPosts`. Handles loading/error state and
 * exposes a `refetch` for manual re-fetching (e.g. a "retry" button).
 *
 * For server components (like `MobileHome`), just call `getLatestPosts()`
 * directly instead — this hook is for client components that need
 * loading/error UI or need to re-fetch after mount.
 */
export function useLatestPosts(): UseLatestPostsResult {
    const [data, setData] = useState<PostList | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true)
        setError(null)

        getLatestPosts()
            .then((result) => {
                if (!cancelled) setData(result)
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error("خطا در دریافت مطالب"))
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [reloadKey])

    const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

    return {
        posts: data?.results ?? [],
        count: data?.count ?? 0,
        isLoading,
        error,
        refetch,
    }
}

interface UsePostResult {
    post: Post | null
    isLoading: boolean
    error: Error | null
    refetch: () => void
}

/**
 * Client-side hook around `getPost`. Pass `null`/`undefined` for `slug` to
 * skip fetching (e.g. while the slug isn't known yet).
 */
export function usePost(slug: string | null | undefined): UsePostResult {
    const [post, setPost] = useState<Post | null>(null)
    const [isLoading, setIsLoading] = useState(Boolean(slug))
    const [error, setError] = useState<Error | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!slug) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPost(null)
            setIsLoading(false)
            return
        }

        let cancelled = false

        setIsLoading(true)
        setError(null)

        getPost(slug)
            .then((result) => {
                if (!cancelled) setPost(result)
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error("خطا در دریافت پست"))
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [slug, reloadKey])

    const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

    return { post, isLoading, error, refetch }
}
