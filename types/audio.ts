export interface Audio {
    id: number
    title: string
    artist: string
    url: string
    cover: string
}

export interface AudioList {
    count: number
    next: string | null
    previous: string | null
    results: Audio[]
}
