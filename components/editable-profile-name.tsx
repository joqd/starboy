"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
    value: string
    onSave: (name: string) => Promise<unknown>
}

export default function EditableProfileName({ value, onSave }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [isSaving, setIsSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isEditing) setDraft(value)
    }, [value, isEditing])

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    }, [isEditing])

    const cancel = () => {
        setDraft(value)
        setIsEditing(false)
    }

    const commit = async () => {
        const trimmed = draft.trim()

        if (!trimmed || trimmed === value) {
            setDraft(value)
            setIsEditing(false)
            return
        }

        setIsSaving(true)
        try {
            await onSave(trimmed)
            setIsEditing(false)
        } catch {
            // Parent already surfaces an error toast; just revert the draft.
            setDraft(value)
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={draft}
                disabled={isSaving}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        commit()
                    }
                    if (e.key === "Escape") {
                        e.preventDefault()
                        cancel()
                    }
                }}
                maxLength={50}
                className="w-full max-w-55 bg-transparent px-1 py-0.5 text-center text-base font-medium text-foreground transition-colors outline-none disabled:opacity-60"
            />
        )
    }

    return (
        <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-base font-medium text-foreground transition-colors outline-none"
        >
            <span>{value || "بدون نام"}</span>
        </button>
    )
}
