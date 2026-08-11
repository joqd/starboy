import request from "@/lib/api/client"
import { PostList, Post } from "@/types/post"

export function getLatestPosts(): Promise<PostList> {
    return request<PostList>("/api/blog/posts/", {
        method: "GET",
    })
}

export function getPost(slug: string): Promise<Post | null> {
    return request<Post>(`/api/blog/posts/${slug}/`, {
        method: "GET",
    })
}
