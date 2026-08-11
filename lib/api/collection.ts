import request from "@/lib/api/client"
import { CollectionList } from "@/types/collection"

export function getCollections(): Promise<CollectionList> {
    return request<CollectionList>("/api/collections/", {
        method: "GET",
    })
}
