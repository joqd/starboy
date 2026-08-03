import request from "@/lib/api/client"
import type { Audio, AudioList } from "@/types/audio"

export function getAudios(): Promise<AudioList> {
    return request<AudioList>("/api/audios/", {
        method: "GET",
    })
}

export function getNextAudio(id: number): Promise<Audio> {
    return request<Audio>(`/api/audios/${id}/next/`, {
        method: "GET",
    })
}

export function getPrevAudio(id: number): Promise<Audio> {
    return request<Audio>(`/api/audios/${id}/previous/`, {
        method: "GET",
    })
}

export function getRandomAudio(): Promise<Audio> {
    return request<Audio>("/api/audios/random/", {
        method: "GET",
    })
}
