import { create } from "zustand"

import type { Audio } from "@/types/audio"

interface AudioPlayerStore {
    currentAudio: Audio | null
    isPlaying: boolean

    setAudio: (audio: Audio | null) => void
    setPlaying: (playing: boolean) => void
}

export const useAudioPlayerStore = create<AudioPlayerStore>((set) => ({
    currentAudio: null,
    isPlaying: false,

    setAudio: (audio) => set({ currentAudio: audio }),
    setPlaying: (isPlaying) => set({ isPlaying }),
}))
