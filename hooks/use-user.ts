"use client"

import { useState } from "react"

import { updateUserAvatar, updateUserName } from "@/lib/api/auth"

import type { User } from "@/types/user"

export function useUser() {
    const [isUpdating, setIsUpdating] = useState(false)

    const changeName = async (fullName: string): Promise<User | null> => {
        try {
            setIsUpdating(true)

            const user = await updateUserName(fullName)

            return user
        } finally {
            setIsUpdating(false)
        }
    }

    const changeAvatar = async (file: File): Promise<User | null> => {
        try {
            setIsUpdating(true)

            const user = await updateUserAvatar(file)

            return user
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        changeName,
        changeAvatar,
        isUpdating,
    }
}
