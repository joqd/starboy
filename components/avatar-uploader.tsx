"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { Camera, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Props = {
    avatar?: string | null
    fallback: string
    onChange: (file: File) => Promise<unknown>
}

export default function AvatarUploader({ avatar, fallback, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return

        setIsUploading(true)
        try {
            await onChange(file)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            aria-label="تغییر تصویر پروفایل"
            className="group relative h-20 w-20 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
        >
            <Avatar className="h-20 w-20 ring-2 ring-border">
                <AvatarImage src={avatar ?? undefined} className="object-cover" />
                <AvatarFallback className="text-xl font-medium">{fallback}</AvatarFallback>
            </Avatar>

            <span
                className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity",
                    "group-hover:opacity-100 group-focus-visible:opacity-100",
                    isUploading && "opacity-100"
                )}
            >
                {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Camera className="h-5 w-5" />
                )}
            </span>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelect}
            />
        </button>
    )
}
