"use client"

import { useState } from "react"

// ---------------------------------------------------------------------------
// CopyLinkButton — the only client-side JS on the post page. Split into its
// own file so importing it doesn't pull the whole page into the client
// bundle; everything else in post-page.tsx renders on the server.
// ---------------------------------------------------------------------------
export function CopyLinkButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false)

    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1800)
                } catch {
                    // Clipboard API can fail (permissions, insecure context) —
                    // fail silently rather than throw in front of the user.
                }
            }}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
            {copied ? "کپی شد" : "کپی لینک"}
        </button>
    )
}
