import useSWR from "swr"

import { getAudios, getNextAudio, getPrevAudio, getRandomAudio } from "@/lib/api/audio"

import { useAudioPlayerStore } from "@/stores/audio-player"

export function useAudio() {
    const { data, error, isLoading, mutate } = useSWR("audios", getAudios)

    const { currentAudio, isPlaying, setAudio, setPlaying } = useAudioPlayerStore()

    const next = async () => {
        if (!currentAudio) return

        const audio = await getNextAudio(currentAudio.id)
        setAudio(audio)

        return audio
    }

    const previous = async () => {
        if (!currentAudio) return

        const audio = await getPrevAudio(currentAudio.id)
        setAudio(audio)

        return audio
    }

    const random = async () => {
        const audio = await getRandomAudio()
        setAudio(audio)

        return audio
    }

    return {
        audios: data?.results ?? [],
        pagination: data,

        currentAudio,
        isPlaying,

        setAudio,
        setPlaying,

        next,
        previous,
        random,

        refresh: mutate,

        isLoading,
        error,
    }
}
