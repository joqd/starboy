"use client"

import { useCallback, useRef, useState } from "react"
import { AlertTriangle, CheckCircle2, X } from "lucide-react"

// Small, dependency-free toast system for transient errors (e.g. a failed
// quantity update) that shouldn't block or reload the whole page.
//
// Note: if this project later adds shadcn's `sonner`-based toaster, this
// file can be replaced by `toast()` calls — kept as-is for now since it's
// a small, self-contained piece with no shadcn equivalent installed.

type ToastVariant = "error" | "success"
export type ToastMessage = { id: number; message: string; variant: ToastVariant }

const TOAST_DURATION_MS = 4000

export function useToasts() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])
    const nextId = useRef(0)

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const pushToast = useCallback(
        (message: string, variant: ToastVariant = "error") => {
            const id = nextId.current++
            setToasts((prev) => [...prev, { id, message, variant }])
            setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
        },
        [dismissToast]
    )

    return { toasts, pushToast, dismissToast }
}

export function ToastStack({
    toasts,
    onDismiss,
}: {
    toasts: ToastMessage[]
    onDismiss: (id: number) => void
}) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="alert"
                    className={`flex w-full max-w-sm items-start gap-2 rounded-xl border p-3.5 text-sm shadow-lg backdrop-blur-sm sm:w-auto ${
                        toast.variant === "error"
                            ? "border-destructive/30 bg-background text-destructive"
                            : "border-emerald-500/30 bg-background text-emerald-600"
                    }`}
                >
                    {toast.variant === "error" ? (
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    ) : (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{toast.message}</span>
                    <button
                        type="button"
                        onClick={() => onDismiss(toast.id)}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="بستن پیام"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            ))}
        </div>
    )
}
