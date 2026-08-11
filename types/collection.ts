export type CollectionList = {
    count: number
    next: string | null
    previous: string | null
    results: CollectionListItem[]
}

export type CollectionListItem = {
    id: number
    title: string
    slug: string
    short_description: string
    image: string | null
    image_dark: string | null
    parent: CollectionListItem | null
}
